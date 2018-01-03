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
const BabelPluginsBuilder = require('../../babel/internal/BabelPluginsBuilder');

describe('BabelPluginsBuilder', () => {

    it('builds a list of plugins - can add string plugin', () => {
        let plugins = new BabelPluginsBuilder();
        plugins.add('check-es2015-constants', { loose: true });
        assert.equal(plugins.build().plugins[0][0], 'check-es2015-constants');
        assert.equal(plugins.build().plugins[0][1].loose, true);
    });

    it('builds a list of plugins - can add pre-required plugin', () => {
        let plugins = new BabelPluginsBuilder();
        plugins.add(require('babel-plugin-check-es2015-constants'), { loose: true });
        assert.equal(plugins.build().plugins[0][1].loose, true);
    });

    it('preserves presets as presets if a string', () => {
        let plugins = new BabelPluginsBuilder();
        plugins.addPreset('env', {
            targets: {
                browsers: [ 'last 2 versions', 'safari >= 7' ]
            }
        });
        let options = plugins.build();
        assert.equal(options.plugins.length, 0);
        assert.equal(options.presets.length, 1);
        assert.equal(options.presets[0][0], 'env');
    });

});
