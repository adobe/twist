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
const assert = require('assert');
const babel = require('babel-core');

const TwistConfiguration = require('../babel/TwistConfiguration');

describe('TwistConfiguration', () => {

    it('should be able to load node configuration and get default plugins', () => {

        var config = new TwistConfiguration('node');
        assert.equal(config.getOption('includeBabelRuntime'), false);
        assert.equal(config.getOption('transformImports'), true);
        assert.equal(config.getOption('useBabelModuleResolver'), true);
        assert.deepEqual(config.getOption('targets'), { node: 'current' });

        let options = config.babelOptions;
        assert.equal(options.plugins.length, 8);
    });

    it('should be able to pass in options to configuration', () => {
        var config = new TwistConfiguration('node', { includeBabelRuntime: true });
        assert.equal(config.getOption('includeBabelRuntime'), true);
    });

    it('loads node configuration with no arguments', () => {
        var config = new TwistConfiguration();
        assert.equal(config.context, 'node');
    });

    it('exposes currentLibrary', () => {
        var config = new TwistConfiguration('webpack');
        assert.equal(config.currentLibrary.parentLibrary, null);
    });

    it('should be able to add and read back an option', () => {

        var config = new TwistConfiguration('webpack');

        assert.throws(() => config.setOption('unknownOption', true), Error, 'Twist Configuration option unknownOption is not defined.');

        assert.equal(config.twistOptions.includeBabelRuntime, false);
        config.setOption('includeBabelRuntime', true);
        assert.equal(config.twistOptions.includeBabelRuntime, true);
    });

    it('should be able to enable a babel plugin as a function, with addBabelPlugin', () => {
        var config = new TwistConfiguration('node');
        function dummyPlugin() {
        }
        assert.equal(config.babelOptions.plugins.length, 8);
        let result = config.addBabelPlugin(dummyPlugin, { option: true });
        assert.equal(result, config);
        assert.equal(config.babelOptions.plugins.length, 9);
        const item = config.babelOptions.plugins.find(item => item[0] === dummyPlugin);
        assert(item);
        assert.deepEqual(item[1], { option: true });
    });

    it('should be able to enable a babel plugin by name, with addBabelPlugin', () => {
        var config = new TwistConfiguration('node');
        assert.equal(config.babelOptions.plugins.length, 8);
        let result = config.addBabelPlugin('dummy-plugin', { option: true });
        assert.equal(result, config);
        assert.equal(config.babelOptions.plugins.length, 9);
        const item = config.babelOptions.plugins.find(item => item[0] === 'dummy-plugin');
        assert(item);
        assert.deepEqual(item[1], { option: true });
    });

    it('addBabelPlugin does not add duplicate plugins', () => {
        var config = new TwistConfiguration('node');
        function dummyPlugin() {
        }
        assert.equal(config.babelOptions.plugins.length, 8);
        config.addBabelPlugin(dummyPlugin, { option: true });
        config.addBabelPlugin(dummyPlugin, { option: false });
        config.addBabelPlugin(dummyPlugin, { option: false });
        assert.equal(config.babelOptions.plugins.length, 9);
        const item = config.babelOptions.plugins.find(item => item[0] === dummyPlugin);
        assert.deepEqual(item[1], { option: true });
    });

    it('should be able to add a library that configures decorators/components', () => {

        var config = new TwistConfiguration('node')
            .addLibrary(path.join(__dirname, 'testLibrary'))
            .addLibrary(path.join(__dirname, 'testLibrary'));

        // Should only add the same library once
        assert.equal(config.numAdded, 1);

        assert.deepEqual(config.decorators.Store, {
            module: '@twist/core',
            export: 'Store',
            inherits: {
                module: '@twist/core',
                export: 'BaseStore'
            }
        });
        assert.deepEqual(config.components['my:component'], {
            module: '@twist/core',
            export: 'MyComponent'
        });

        // Should be present as auto imports in twistOptions too:
        let twistOptions = config.twistOptions;
        assert.deepEqual(twistOptions.autoImport, Object.assign({}, config.decorators, config.components));

        // Should add an override for inherits:
        assert(/babel\/third_party\/inherits/.test(twistOptions.aliases['babel-runtime/helpers/inherits']));
        assert.equal(twistOptions.aliases['test-library'], path.join(__dirname, 'testLibrary'));
    });

    it('transforms async without the regenerator transform by default', () => {
        var config = new TwistConfiguration('webpack');
        config.setOption('targets', { browsers: 'IE 9' });
        config.setOption('includeBabelRuntime', true);
        assert.equal(babel.transform(`
        async function foo() {
            await Promise.resolve();
        }
        `, config.babelOptions).code.trim(), `
"use strict";

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function foo() {
    return new Promise(function ($return, $error) {
        return Promise.resolve(_promise2.default.resolve()).then(function ($await_1) {
            try {
                return $return();
            } catch ($boundEx) {
                return $error($boundEx);
            }
        }.bind(this), $error);
    }.bind(this));
}
        `.trim());
    });

    it('transforms async with the regenerator transform if necessary', () => {
        var config = new TwistConfiguration('node');
        config.setOption('targets', { browsers: 'IE 9' });
        config.setOption('includeBabelRuntime', true);
        config.setOption('regenerator', true);
        let code = babel.transform(`
        async function foo() {
            await Promise.resolve();
        }
        `, config.babelOptions).code;

        assert(code.indexOf('require("babel-runtime/regenerator");') !== -1);
    });

});
