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

/* global describe, it */

const assert = require('assert');
const LibraryLoader = require('../../../babel/internal/LibraryLoader');

describe('LibraryLoader', () => {
    it('loadLibrary', () => {
        const loader = new LibraryLoader();
        const libraryFn = (config, options) => {
            config.calledWithConfig = config;
            config.calledWithOptions = options;
        };
        const config = {};
        const options = {};
        loader.loadLibrary(libraryFn, config, options);

        assert.strictEqual(config.calledWithConfig, config);
        assert.strictEqual(config.calledWithOptions, options);
    });

    it('getPackageJsonInfo', () => {
        const myPath = require.resolve('../package.json');
        const myMod = require(myPath);
        const packageJsonInfo = LibraryLoader.getPackageJsonInfo(__dirname);
        assert.deepEqual(packageJsonInfo, {
            path: myPath,
            contents: myMod
        });
        assert(!LibraryLoader.getPackageJsonInfo('/nonexistent-dir/'));
    });

    it('setPathOfCurrentLibrary, loading libraries & duplicate handling', () => {
        const originalGetPackageJsonInfo = LibraryLoader.getPackageJsonInfo;
        const loader = new LibraryLoader();

        function setPackageJson(name, version) {
            LibraryLoader.getPackageJsonInfo = () => ({
                path: '/some/fake/package.json',
                contents: { name, version }
            });
        }

        function pretendLoadLibrary(name, version, cb) {
            setPackageJson(name, version);
            loader.loadLibrary(() => {
                loader.setPathOfCurrentLibrary('.');

                // Setting the path again should have no effect (i.e. we should NOT grab package.json changes here)
                setPackageJson('another lib', '0.0');
                loader.setPathOfCurrentLibrary('...');

                assert.equal(loader.currentLibrary.name, name);
                assert.equal(loader.currentLibrary.version, version);
                assert.equal(loader.currentLibrary.path, '/some/fake');
                cb && cb();
            });
        }

        pretendLoadLibrary('LibraryA', '1.0', () => {
            pretendLoadLibrary('LibraryB', '2.0', () => {
                pretendLoadLibrary('LibraryC', '3.0', () => {
                    assert.throws(() => {
                        pretendLoadLibrary('LibraryB', '4.0');
                    }, (err) => err.message === `\
You're trying to load LibraryB 4.0, but LibraryB 2.0 was already loaded:

    LibraryB 4.0
      └─ loaded by LibraryC 3.0
        └─ loaded by LibraryB 2.0
          └─ loaded by LibraryA 1.0
            └─ loaded by (root)

    LibraryB 2.0
      └─ loaded by LibraryA 1.0
        └─ loaded by (root)

`);
                });
            });
        });

        // Even though we threw an exception, we still have the last library stored.
        assert.equal(loader.libraryInfos.length, 4);
        assert.deepEqual(loader.libraryInfos.map(info => info.version), [ '1.0', '2.0', '3.0', '4.0' ]);
        assert.deepEqual(loader.libraryInfos.map(info => info.name), [ 'LibraryA', 'LibraryB', 'LibraryC', 'LibraryB' ]);

        LibraryLoader.getPackageJsonInfo = originalGetPackageJsonInfo;
    });
});
