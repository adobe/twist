/*
 *  Copyright 2016 Adobe Systems Incorporated. All rights reserved.
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

const BabelConfig = require('./internal/BabelConfig');
const LibraryLoader = require('./internal/LibraryLoader');

const DEFAULT_OPTIONS = {
    includeBabelRuntime: false,
    jsxSourceLines: false,

    polyfill: true,
    regenerator: false,
    targets: { node: 'current' },
    transformImports: true,
    useBabelModuleResolver: true,
};

module.exports = class TwistConfiguration {

    /**
     * Create a Twist configuration. A "contextName" describes the specific context in which this configuration is
     * being applied, such as "node" or "webpack". The default context is "node"; other build systems
     * (like a webpack plugin) may subclass this configuration and provide additional functionality;
     * libraries should switch on `this.context` to decide how to add any plugins/loaders as necessary.
     *
     * @param {string} [contextName]
     * @param {object} [options]
     * @param {object} [env]
     */
    constructor(contextName, options) {
        this.context = contextName || 'node';

        // The options that you can configure (these are the default options below):
        this._options = Object.assign({}, DEFAULT_OPTIONS, options || {});

        // Twist compiler settings
        this._components = {};
        this._decorators = {};

        /** @property {Array<[ BabelModule, object ]>} */
        this._babelPlugins = [];

        // Path aliases (e.g. mapping an alias to a folder)
        this._pathAliases = {
            'babel-runtime/helpers/inherits': require.resolve('./third_party/inherits')
        };

        this._libraryLoader = new LibraryLoader();
    }

    /**
     * Get the current library. If not within a library (i.e. not inside an addLibrary() call), returns a
     * root library that has `parentLibrary` set to null.
     * @return {LibraryInfo}
     */
    get currentLibrary() {
        return this._libraryLoader.currentLibrary;
    }

    /**
     * Get the locations on disk of the loaded libraries.
     * @return {Object} A mapping from library name to path.
     */
    get libraryLocations() {
        let libraries = {};
        this._libraryLoader.libraryInfos.forEach(library => {
            libraries[library.name] = library.path;
        });
        return libraries;
    }

    /**
     * Add more Twist libraries to the configuration, using this method. e.g. `config.addLibrary('@twist/module');`
     * This allows the given library to add to the configuration (e.g. defining new decorators/components). The library function
     * can invoke methods like `addDecorator`, `addComponent` etc, to add to the configuration.
     *
     * This effectively calls `require('@twist/module/config')(config)` under the hood, and maintains version information
     * for the currently loaded libraries.
     *
     * @param {string} library The npm name of the library to add (passes in the configuration to `library/config.js`)
     * @param {Object|value} [options] Options to pass to the library
     */
    addLibrary(library, options) {
        this._libraryLoader.loadLibrary(library, this, options);
        return this;
    }

    /**
     * Add a custom Babel plugin.
     *
     * @param {BabelPlugin|string} plugin
     * @param {object} [options]
     */
    addBabelPlugin(plugin, options) {
        // Don't add a plugin more than once.
        if (this._babelPlugins.find(item => item[0] === plugin)) {
            return;
        }
        this._babelPlugins.push([ plugin, options ]);
        return this;
    }

    /**
     * Set an option in the Twist configuration. Supported options are:
     *
     * includeBabelRuntime      [true]      Include Babel runtime.
     * polyfill                 [true]      Include Babel polyfill (if including Babel runtime).
     * regenerator              [false]     Include Babel regenerator (if including Babel runtime).
     * targets                  [undefined] A babel-preset-env `targets` configuration, e.g. `{ browsers: 'last 2 versions' }`.
     * transformImports         [false]     Transforms imports to CommonJS requires.
     * useBabelModuleResolver   [false]     Use the Babel module resolver to resolve imports.
     *
     * @param {string} name
     * @param {string|number|Boolean} value
     */
    setOption(name, value) {
        if (!this._options.hasOwnProperty(name)) {
            throw new Error('Twist Configuration option ' + name + ' is not defined.');
        }
        this._options[name] = value;
        return this;
    }

    /**
     * Get the value of an option in the Twist configuration.
     *
     * @param {string} name
     * @return {string|number|Boolean}
     */
    getOption(name) {
        return this._options[name];
    }

    /**
     * Add a global component to the Twist compiler configuration
     * @param {string} name
     * @param {Object} config
     */
    addComponent(name, config) {
        this._components[name] = config;
        return this;
    }

    /**
     * Add a decorator to the Twist compiler configuration
     * @param {string} name
     * @param {Object} config
     */
    addDecorator(name, config) {
        this._decorators[name] = config;
        return this;
    }

    /**
     * The configured components
     */
    get components() {
        return this._components;
    }

    /**
     * The configured decorators
     */
    get decorators() {
        return this._decorators;
    }

    /**
     * The complete Twist configuration options
     */
    get twistOptions() {
        const aliases = Object.assign({}, this.libraryLocations, this._pathAliases);
        const autoImport = Object.assign({}, this._decorators, this._components);
        const plugins = this._babelPlugins.slice();

        return Object.assign({}, this._options, {
            aliases,
            autoImport,
            plugins
        });
    }

    /**
     * The configuration of Babel (options passed via .babelrc, or to the webpack babel-loader).
     */
    get babelOptions() {
        return BabelConfig.build(this.twistOptions);
    }
};
