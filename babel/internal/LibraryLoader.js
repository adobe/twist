/*
 *  Copyright 2017 Adobe Systems Incorporated. All rights reserved.
 *  This file is licensed to you under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License. You may obtain a copy
 *  of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software distributed under
 *  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 *  OF ANY KIND, either express or implied. See the License for the specific language
 *  governing permissions and limitations under the License.
 *
 */

const path = require('path');
const fs = require('fs');

class LibraryInfo {
    constructor(libraryFn, parentLibrary) {
        this.libraryFn = libraryFn;
        this.parentLibrary = parentLibrary;
        /** The "name" field from this library's package.json. */
        this.name = null;
        /** The "version" field from this library's package.json. */
        this.version = null;
        /** The directory containing this library's package.json file, if one was found. */
        this.path = null;
    }

    /**
     * Return a string describing the list of libraries which loaded this library, much like a stack trace.
     */
    getLibraryChainStackTrace() {
        const stack = [];
        let parent = this;
        let indent = 4;
        let isFirstLine = true;
        while (parent) {
            let line = `${parent.name}${parent.version ? ' ' + parent.version : ''}`;
            let prefix = '';
            for (let i = 0; i < indent; i++) {
                prefix += ' ';
            }
            if (isFirstLine) {
                isFirstLine = false;
            }
            else {
                line = '└─ loaded by ' + line;
            }
            stack.push(prefix + line);
            indent += 2;
            parent = parent.parentLibrary;
        }
        return stack.join('\n');
    }
}

/**
 * LibraryLoader manages library loading, ensuring that multiple versions of the same library are not
 * loaded simultaneously. A library is an npm module with a root `config.js` file with the following signature:
 *
 *   function myLibrary(config, options) {
 *      ...
 *      // calls to add to the configuration, e.g. config.addDecorator(), config.addComponent(), etc.
 *   }
 *
 * Libraries should place all their code in a `src` directory - this is the library's filesystem path, which is used
 * for two purposes:
 *
 *    1. tracking the versions of loaded libraries to prevent duplicates (by walking up the directory
 *       tree to find `package.json`), and
 *    2. to enforce that the library only adds loaders that are scoped to files contained within that package.
 */
module.exports = class LibraryLoader {

    constructor() {
        /**
         * All of the loaded libraries.
         * @member {LibraryInfo[]}
         */
        this.libraryInfos = [];
        /**
         * The current library being loaded.
         * @member {LibraryInfo}
         */
        this.currentLibrary = new LibraryInfo();
        this.currentLibrary.name = '(root)';
        this.currentLibrary.version = '';
    }

    /**
     * Add a library. Calls `libraryFn(config, options)`. The `addPath` function should be called at least once
     * from within `libraryFn`, so that we can extract the path of the library.
     * @param {string} libraryName
     * @param {TwistConfiguration} config
     * @param {object} [options]
     */
    loadLibrary(libraryName, config, options) {

        // Resolve the library to its config.js file
        let configName = libraryName + '/config';
        let libraryFn;
        try {
            libraryFn = require(configName);
        }
        catch (e) {
            throw new Error(`Failed to load ${libraryName} - check that the node module is installed, and that it has a config.js in its root`);
        }
        let srcPath = path.join(path.dirname(require.resolve(configName)), 'src');

        if (libraryFn.default) {
            libraryFn = libraryFn.default;
        }
        // If we've already loaded this module, we don't need to load it again.
        if (this.libraryInfos.find(lib => lib.libraryFn === libraryFn)) {
            return;
        }
        const libraryInfo = new LibraryInfo(libraryFn, this.currentLibrary);
        this.libraryInfos.push(libraryInfo);
        this.currentLibrary = libraryInfo;
        this._setPathOfCurrentLibrary(srcPath);
        libraryFn(config, options);
        this.currentLibrary = libraryInfo.parentLibrary;
    }

    /**
     * Set the filesystem path of the current library, if it has not already been set.
     * Once we know the path of the current library, we're able to walk the filesystem to find its `package.json`,
     * and hence its version. If we've already loaded a different version of this package, throw an error.
     * @param {string} directory
     * @private
     */
    _setPathOfCurrentLibrary(dir) {
        // If we already have the information for this library, we've already checked that it doesn't conflict.
        if (this.currentLibrary.name) {
            return;
        }
        // Load the name and version from the nearest package.json.
        const packageJsonInfo = LibraryLoader.getPackageJsonInfo(dir);
        if (!packageJsonInfo) {
            // We should almost always have a package.json. If we don't, just assume it doesn't conflict.
            // (We still initialize the path alias in TwistConfiguration.)
            return;
        }
        this.currentLibrary.name = packageJsonInfo.contents.name;
        this.currentLibrary.version = packageJsonInfo.contents.version;
        this.currentLibrary.path = path.dirname(packageJsonInfo.path);

        // If we haven't already loaded a library with this name, store it now.
        const existingLib = this.libraryInfos.find(lib => lib.name === this.currentLibrary.name);
        // If the library we're loading has already been loaded with a different version, throw an error.
        if (existingLib && existingLib.version !== this.currentLibrary.version) {
            throw new Error(`You're trying to load ${this.currentLibrary.name} ${this.currentLibrary.version}, but `
                + `${existingLib.name} ${existingLib.version} was already loaded:\n\n`
                + this.currentLibrary.getLibraryChainStackTrace()
                + '\n\n'
                + existingLib.getLibraryChainStackTrace() + '\n\n');
        }
    }

    /**
     * @typedef {object} PackageJsonInfo
     * @property {string} path
     * @property {object} contents
     */

    /**
     * Starting at `libraryPath`, walk the directory tree until a `package.json` is found.
     * If found, return the parsed version; otherwise return undefined.
     * @param {string} libraryPath
     * @return {PackageJsonInfo|undefined}
     */
    static getPackageJsonInfo(libraryPath) {
        // Ensure this path is normalized and absolute.
        libraryPath = path.resolve(path.normalize(libraryPath));
        let parentPath;
        do {
            const possiblePackageJsonFile = path.join(libraryPath, 'package.json');
            if (fs.existsSync(possiblePackageJsonFile)) {
                try {
                    return {
                        path: possiblePackageJsonFile,
                        contents: require(possiblePackageJsonFile),
                    };
                }
                catch (e) {
                    // If there's invalid JSON for some weird reason, just keep going up.
                }
            }
            // When we've reached the root, parentPath === libraryPath === '/'; it never returns undefined.
            parentPath = path.dirname(libraryPath);
        } while (libraryPath !== parentPath && (libraryPath = parentPath));
    }
};
