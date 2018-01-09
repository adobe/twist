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
import ObjectUtils from '../../../src/internal/utils/ObjectUtils';

describe('Utils.ObjectUtils', () => {
    it('deepEqual', () => {
        let date = new Date();
        let date2 = new Date(date.getTime());
        let map1 = new Map([ [ 1, 2 ], [ 3, 4 ] ]);
        let map2 = new Map([ [ 1, 2 ], [ 3, 4 ] ]);
        let set1 = new Set([ 1, 2 ]);
        let set2 = new Set([ 1, 2 ]);
        let typed1 = new Uint8Array(2);
        let typed2 = new Uint8Array(2);
        typed1[0] = 1;
        typed2[0] = 1;
        assert(ObjectUtils.deepEqual([ 1 ], [ 1 ]), 'arrays are equal');
        assert(ObjectUtils.deepEqual({ x: 1 }, { x: 1 }), 'objects are equal');
        assert(ObjectUtils.deepEqual(date, date2), 'dates are equal');
        assert(ObjectUtils.deepEqual(/a/, /a/), 'regexps are equal');
        assert(ObjectUtils.deepEqual(null, null), 'nulls are equal');
        assert(ObjectUtils.deepEqual(undefined, undefined), 'undefineds are equal');
        assert(ObjectUtils.deepEqual(typed1, typed2), 'typed arrays are equal');
        assert(ObjectUtils.deepEqual(typed1.buffer, typed2.buffer), 'typed array buffers are equal');
        assert(ObjectUtils.deepEqual(map1, map2), 'maps are equal');
        assert(ObjectUtils.deepEqual(set1, set2), 'sets are equal');
        assert(ObjectUtils.deepEqual({ x: 1, y: 2 }, { y: 2, x: 1 }), 'objects with different orders are equal');

        assert(!ObjectUtils.deepEqual([ 1 ], [ 2 ]), 'arrays are not equal');
        assert(!ObjectUtils.deepEqual({ x: 1 }, { x: 2 }), 'objects are not equal');
        assert(!ObjectUtils.deepEqual(date, new Date(1000000)), 'dates are not equal');
        assert(!ObjectUtils.deepEqual(/a/, /a/g), 'regexps are not equal');
        assert(!ObjectUtils.deepEqual(null, undefined), 'nulls are not equal');
        assert(!ObjectUtils.deepEqual(undefined, 3), 'undefineds are not equal');
        assert(!ObjectUtils.deepEqual(typed1, new Uint8Array(2)), 'typed arrays are not equal');
        assert(!ObjectUtils.deepEqual(typed1.buffer, new Uint8Array(2).buffer), 'typed array buffers are not equal');
        assert(!ObjectUtils.deepEqual(map1, new Map([ [ 5, 6 ], [ 7, 8 ] ])), 'maps are not equal');
        assert(!ObjectUtils.deepEqual(set1, new Set([ 3, 4 ])), 'sets are not equal');
        // These two are equal.
        assert(ObjectUtils.deepEqual(
            { a: 1, b: [ /abc/, date, { c: 3 } ] },
            { a: 1, b: [ /abc/, date2, { c: 3 } ] },
        ));
        // These differ by one (nested) property.
        assert(!ObjectUtils.deepEqual(
            { a: 1, b: [ /abc/, date, { c: 3 } ] },
            { a: 1, b: [ /abc/, date2, { c: 3, d: 4 } ] },
        ));
    });
});
