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

/* global it, describe */

import assert from 'assert';

import { Store, State, Action } from '../index';

describe('Custom Middleware', () => {

    it('Can supply custom middleware, to transform an action', () => {

        var customMiddleware = function(store, action, payload, next) {
            if (action === 'INCR') {
                next('ADD', 1);
            }
            else {
                next();
            }
        };

        @Store
        class TestStore {
            @State.byVal x;

            @Action ADD(n) {
                this.x += n;
            }
        }

        var test = new TestStore({ x: 2 }, customMiddleware);

        test.dispatch('ADD', 5);
        assert.equal(test.x, 7);

        test.dispatch('INCR');
        assert.equal(test.x, 8);

    });

});
