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
import Utils from '../Utils';

// We sneak a look at ActionDispatcher as part of the tests, but it's internal
import ActionDispatcher from '../../src/internal/state/ActionDispatcher';

import { Action, Store, State } from '../../index';

describe('@Action decorator', () => {

    it('@Action not allowed on a class', () => {

        function test() {
            @Action
            class TestClass {
            }
            assert(TestClass);
        }

        Utils.assertError(test, '@Action must be used on a method, not a class.');
    });

    it('@Action not allowed on a property that\'s not a method', () => {

        function test() {
            @Store
            class TestClass {
                @Action x;
            }
            assert(TestClass);
        }

        Utils.assertError(test, '@Action can only be used with a method (the handler for the action)');
    });

    it('@Action not allowed on a non-Store', () => {

        function test() {
            class TestClass {
                @Action ACTION() {
                    return;
                }
            }
            assert(TestClass);
        }

        Utils.assertError(test, '@Action can only be used for methods on a Store');
    });

    // TODO: Enable this test once the decorator syntax is fixed
    // it('@Action not allowed to contain the "/" or "@" character', () => {
    //
    //     function test() {
    //         @Store
    //         class TestClass {
    //             @Action ['ACTION/1']() {
    //                 return;
    //             }
    //         }
    //     }
    //
    //     Utils.assertError(test, '@Action name can\'t include the "/" character');
    // });

    it('@Action can dispatch another action', () => {

        @Store
        class TestClass {
            @State.byVal y;

            @Action X() {
                this.dispatch('Y');
            }
            @Action Y() {
                this.y = 2;
            }
        }

        var test = new TestClass();
        test.dispatch('X');
        assert.equal(test.y, 2);
    });

    it('@Action cannot dispatch an asynchronous action', () => {

        @Store
        class TestClass {
            @State.byVal y;

            @Action X() {
                this.dispatch(() => this.dispatch('Y'));
            }
            @Action Y() {
                this.y = 2;
            }
        }

        var test = new TestClass();

        Utils.assertError(() => test.dispatch('X'), 'Cannot dispatch an asynchronous action from a synchronous action');
        assert(!ActionDispatcher.active);
        assert.equal(test.y, undefined);
    });

    it('ActionDispatcher gives an error if start and end don\'t match', () => {

        assert(!ActionDispatcher.active);

        ActionDispatcher.start('X');
        Utils.assertError(() => ActionDispatcher.end('Y'), 'ActionDispatcher: Expected to end X, but instead ended a different action of type Y');
        assert(ActionDispatcher.active);

        // Now, exit the action
        ActionDispatcher.end('X');
        assert(!ActionDispatcher.active);
    });

});
