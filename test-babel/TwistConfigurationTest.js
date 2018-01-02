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

var assert = require('assert');
var babel = require('babel-core');

var TwistConfiguration = require('../../babel/TwistConfiguration');

describe('TwistConfiguration', () => {

    it('should get an error if use the old babelPlugins API', () => {
        var config = new TwistConfiguration('node');
        let test = () => config.babelPlugins;
        assert.throws(test, Error);
    });

    it('should be able to load node configuration and get default plugins', () => {

        var config = new TwistConfiguration('node');
        assert.equal(config.getOption('includeBabelRuntime'), false);
        assert.equal(config.getOption('transformImports'), true);
        assert.equal(config.getOption('useBabelModuleResolver'), true);
        assert.deepEqual(config.getOption('targets'), { node: 'current' });

        let options = config.babelOptions;
        assert.equal(options.plugins.length, 13);
    });

    it('should be able to load webpack configuration and get default plugins', () => {

        var config = new TwistConfiguration('webpack');
        assert.equal(config.context, 'webpack');
        assert.equal(config.getOption('includeBabelRuntime'), true);
        assert.equal(config.getOption('transformImports'), false);
        assert.equal(config.getOption('useBabelModuleResolver'), false);
        assert(config.getOption('targets').browsers);

        let options = config.babelOptions;
        assert.equal(options.plugins.length, 12);
    });

    it('should be able to load webpack configuration with new options', () => {
        var config = new TwistConfiguration('webpack', { includeBabelRuntime: false });
        assert.equal(config.getOption('includeBabelRuntime'), false);
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

        assert.equal(config.twistOptions.includeBabelRuntime, true);
        config.setOption('includeBabelRuntime', false);
        assert.equal(config.twistOptions.includeBabelRuntime, false);
    });

    it('should be able to enable transformObjectRestSpread the old way', () => {
        var config = new TwistConfiguration('node');

        assert.equal(config.babelOptions.plugins.length, 13);
        config.enableBabelPlugin('transformObjectRestSpread');
        assert.equal(config.babelOptions.plugins.length, 14);
    });

    it('does not add transformObjectRestSpread twice if we provide it with addBabelPlugin', () => {
        var config = new TwistConfiguration('node');
        assert.equal(config.babelOptions.plugins.length, 13);
        config.enableBabelPlugin('transformObjectRestSpread');
        config.addBabelPlugin('transform-object-rest-spread');
        assert.equal(config.babelOptions.plugins.length, 14);
    });

    it('does not die trying to add an unsupported plugin', () => {

        var config = new TwistConfiguration('node');
        assert.equal(config.babelOptions.plugins.length, 13);
        config.enableBabelPlugin('nonexistent');
        assert.equal(config.babelOptions.plugins.length, 13);
    });

    it('should be able to enable a babel plugin with addBabelPlugin', () => {
        var config = new TwistConfiguration('node');
        function dummyPlugin() {
        }
        assert.equal(config.babelOptions.plugins.length, 13);
        let result = config.addBabelPlugin(dummyPlugin, { option: true });
        assert.equal(result, config);
        assert.equal(config.babelOptions.plugins.length, 14);
        const item = config.babelOptions.plugins.find(item => item[0] === dummyPlugin);
        assert(item);
        assert.deepEqual(item[1], { option: true });
    });

    it('addBabelPlugin does not add duplicate plugins', () => {
        var config = new TwistConfiguration('node');
        function dummyPlugin() {
        }
        assert.equal(config.babelOptions.plugins.length, 13);
        config.addBabelPlugin(dummyPlugin, { option: true });
        config.addBabelPlugin(dummyPlugin, { option: false });
        config.addBabelPlugin(dummyPlugin, { option: false });
        assert.equal(config.babelOptions.plugins.length, 14);
        const item = config.babelOptions.plugins.find(item => item[0] === dummyPlugin);
        assert.deepEqual(item[1], { option: true });
    });

    it('should be able to add a library that configures decorators/components', () => {

        var numAdded = 0;

        var library = function(config) {
            numAdded++;
            return config
                .addDecorator('Component', {
                    classPath: 'torq/decorators/Component',
                    inherits: 'torq/jsx/Component',
                    hotReload: 'torq/decorators/HotReload',
                })
                .addComponent('g', { group: true });
        };

        var defaultsLibrary = {
            default: library
        };

        var config = new TwistConfiguration('node')
            .addLibrary(library)
            .addLibrary(defaultsLibrary);

        // Should only add the same library once
        assert.equal(numAdded, 1);

        assert(/@twist\/core\/babel\/third_party\/inherits/.test(config.pathAliases['babel-runtime/helpers/inherits']));
        assert.equal(config.pathAliases['@twist/core'], '/path/to/twist');
        assert.deepEqual(config.decorators.Component, {
            classPath: 'torq/decorators/Component',
            inherits: 'torq/jsx/Component',
            hotReload: 'torq/decorators/HotReload'
        });
        assert.deepEqual(config.components.g, { group: true });

        // Should be present in twistOptions too:
        assert.deepEqual(config.twistOptions.autoImport, Object.assign({}, config.decorators, config.components));
    });

    it('transforms async without the regenerator transform by default', () => {
        var config = new TwistConfiguration('webpack');
        config.setOption('targets', { browsers: 'IE 9' });
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
        var config = new TwistConfiguration('webpack');
        config.setOption('targets', { browsers: 'IE 9' });
        config.setOption('regenerator', true);
        let code = babel.transform(`
        async function foo() {
            await Promise.resolve();
        }
        `, config.babelOptions).code;

        assert(code.indexOf('require("babel-runtime/regenerator");') !== -1);
    });

});
