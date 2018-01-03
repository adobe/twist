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

const TargetsMeta = require('./TargetsMeta');
const BabelPluginsBuilder = require('./BabelPluginsBuilder');

module.exports = class BabelConfig {

    /**
     * Return an array of Babel plugins, configured with the given Twist configuration options.
     * @param {TwistConfigurationOptions} options
     * @return {BabelPlugin[]}
     */
    static build(options) {
        // While we can use babel-preset-env to determine which babel plugins to include at a granular level,
        // some features need a binary switch:
        //   - UglifyJS only parses ES5 code, not ES6.
        //   - We transform modules to es2015-modules-commonjs in ES5 mode.
        //   - ES5 browsers need polyfills to support ES6 builtins like Map, Set, and Promise.
        const requiresES5 = TargetsMeta.doTargetsRequireES5(options.targets);

        const plugins = new BabelPluginsBuilder();

        // The transform-runtime "polyfill" option _only_ polyfills ES6 builtins, not instance methods. Users can include
        // the `babel-polyfill` module to provide more comprehensive polyfills (including instance methods); if so,
        // babel-preset-env will automatically transpile calls to `babel-polyfill` to only include polyfills needed
        // to support targeted browsers.
        if (options.includeBabelRuntime) {
            plugins.add('transform-runtime', { 'polyfill': requiresES5, 'regenerator': options.regenerator });
        }

        if (options.plugins) {
            options.plugins.forEach((item) => {
                plugins.add(item[0], item[1]);
            });
        }

        plugins.add(__dirname + '/ParserOptions');

        if (options.useBabelModuleResolver) {
            plugins.add('module-resolver', { alias: options.aliases });
        }

        // Note: The Twist plugin will vary depending on the underlying UI framework - so this can be overridden by
        // the twistPlugin option of TwistConfiguration
        plugins.add(options.twistPlugin || '@twist/babel-plugin-transform', options);

        // Support decorators:
        plugins.add('transform-decorators-legacy');
        plugins.add('transform-class-properties');

        // These plugins analyze `options.targets`, automatically determining which standards-track plugins need to be
        // included to support the targeted browsers.
        plugins.addPreset('env', {
            targets: Object.assign({
                uglify: requiresES5
            }, options.targets),
            debug: false,
            useBuiltIns: true,
            exclude: options.regenerator ? [] : [
                'transform-regenerator',
                'transform-async-to-generator'
            ]
        });

        if (!options.regenerator) {
            plugins.add('fast-async', { spec: true });
        }

        // Only especially old browsers need to transpile "const" to "var" (like Safari 9).
        if (TargetsMeta.doTargetsRequireConstTransform(options.targets)) {
            plugins.add('transform-es2015-constants');
        }

        if (requiresES5 || options.transformImports) {
            plugins.add('transform-es2015-modules-commonjs', { loose: true });
        }

        return plugins.build();
    }
};
