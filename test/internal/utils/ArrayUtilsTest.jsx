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

/* global describe it */

import assert from 'assert';
import sinon from 'sinon';
import ArrayUtils from '../../../src/internal/utils/ArrayUtils';

describe('Utils.ArrayUtils', () => {

    function testFind() {
        const arr = [ 1, 2, 3, 4, 5 ];
        const thisArg = {};
        const predicate = sinon.spy((x) => x === 3);
        assert.equal(ArrayUtils.find(arr, predicate, thisArg), 3);

        assert.equal(predicate.thisValues[0], thisArg);
        assert.deepEqual(predicate.getCall(0).args, [ 1, 0, arr ]);
        assert.deepEqual(predicate.getCall(1).args, [ 2, 1, arr ]);
        assert.deepEqual(predicate.getCall(2).args, [ 3, 2, arr ]);
    }

    it('.find() native implementation', () => {
        testFind();
    });

    it('.find() shim implementation', () => {
        const originalFind = Array.prototype.find;
        delete Array.prototype.find;

        testFind();

        Array.prototype.find = originalFind;
    });

    it('.polyfill()', () => {
        const originalFind = Array.prototype.find;
        delete Array.prototype.find;
        ArrayUtils.polyfill();
        assert.equal(typeof Array.prototype.find, 'function');
        Array.prototype.find = originalFind;
    });

    it('null array args', () => {
        assert.equal(ArrayUtils.find(null, () => true), undefined);
    });

});
