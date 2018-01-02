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
const TargetsMeta = require('../../../babel/internal/TargetsMeta');

describe('TargetsMeta', () => {

    it('doTargetsRequireES5', () => {
        assert.equal(TargetsMeta.doTargetsRequireES5({ browsers: 'ie 9' }), true);
        assert.equal(TargetsMeta.doTargetsRequireES5({ browsers: 'last 1 Chrome versions' }), false);
        assert.equal(TargetsMeta.doTargetsRequireES5({ torqWebCompiler: 'es5' }), true);
        assert.equal(TargetsMeta.doTargetsRequireES5({ torqWebCompiler: 'es6' }), false);
    });

    it('doTargetsRequireConstTransform', () => {
        assert.equal(TargetsMeta.doTargetsRequireConstTransform({ browsers: 'ie 9' }), true);
        assert.equal(TargetsMeta.doTargetsRequireConstTransform({ browsers: 'safari 9' }), true);
        assert.equal(TargetsMeta.doTargetsRequireConstTransform({ browsers: 'last 1 Chrome versions' }), false);
        assert.equal(TargetsMeta.doTargetsRequireConstTransform({ torqWebCompiler: 'es5' }), true);
        assert.equal(TargetsMeta.doTargetsRequireConstTransform({ torqWebCompiler: 'es6' }), false);
    });

});
