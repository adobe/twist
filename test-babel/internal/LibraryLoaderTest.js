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

const path = require('path');
const sinon = require('sinon');
const assert = require('assert');
const mock = require('mock-require');
const LibraryLoader = require('../../babel/internal/LibraryLoader');

describe('LibraryLoader', () => {
    it('loadLibrary', () => {
        const loader = new LibraryLoader();
        const config = {
            addDecorator: () => config,
            addComponent: () => config
        };
        sinon.spy(config, 'addDecorator');
        sinon.spy(config, 'addComponent');
        const options = {};
        loader.loadLibrary(path.join(__dirname, '../testLibrary'), config, options);

        assert.equal(config.addDecorator.callCount, 1);
        assert.equal(config.addComponent.callCount, 1);
        assert.strictEqual(config.passedOptions, options);
    });

    it('getPackageJsonInfo', () => {
        const myPath = require.resolve('../../package.json');
        const myMod = require(myPath);
        const packageJsonInfo = LibraryLoader.getPackageJsonInfo(__dirname);
        assert.deepEqual(packageJsonInfo, {
            path: myPath,
            contents: myMod
        });
        assert(!LibraryLoader.getPackageJsonInfo('/nonexistent-dir/'));
    });

    it('loading libraries & duplicate handling', () => {
        const loader = new LibraryLoader();

        let packageJsonInfo;
        function setPackageJson(name, version) {
            packageJsonInfo = {
                path: '/some/fake/package.json',
                contents: { name, version }
            };
        }

        function pretendLoadLibrary(name, version, cb) {
            // loadLibrary() is going to try to require the config file, so need to mock it out
            mock(name + '/config', cb => cb());

            setPackageJson(name, version);
            loader.loadLibrary(name, () => {
                assert.equal(loader.currentLibrary.name, name);
                assert.equal(loader.currentLibrary.version, version);
                assert.equal(loader.currentLibrary.path, '/some/fake');
                cb && cb();
            });
        }

        // We need to mock out the code to get the src dir as well, because this calls require.resolve
        // (mock only mocks out require, not require.resolve)
        sinon.stub(LibraryLoader, 'getSourceDir').callsFake(x => x);
        sinon.stub(LibraryLoader, 'getPackageJsonInfo').callsFake(() => packageJsonInfo);

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

        mock.stopAll();
    });
});
