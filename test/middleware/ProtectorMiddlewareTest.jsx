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

import { Store, State, Action, protectorMiddleware } from '../index';

describe('Protector Middleware', () => {

    it('@Action cannot perform asynchronous operations (promises, timeout etc), when protector middleware is enabled', () => {

        @Store
        class TestClass {
            @State.byVal y;

            @Action P1() {
                return new window.Promise(resolve => resolve()).then(() => this.y = 1);
            }
            @Action P2() {
                return Promise.resolve(2).then(() => this.y = 1);
            }
            @Action P3() {
                return Promise.reject(2).then(() => this.y = 1);
            }
            @Action P4() {
                return Promise.all([]).then(() => this.y = 1);
            }
            @Action P5() {
                return Promise.race().then(() => this.y = 1);
            }

            @Action T() {
                setTimeout(() => this.y = 1);
            }

            @Action I() {
                setInterval(() => this.y = 1);
            }
        }

        var test = new TestClass({}, protectorMiddleware);

        Utils.assertError(() => test.dispatch('P1'), 'Calling new Promise() from a synchronous action is not allowed. Please use an asynchronous action for this: @Action({async: true})');
        Utils.assertError(() => test.dispatch('P2'), 'Calling Promise.resolve() from a synchronous action is not allowed. Please use an asynchronous action for this: @Action({async: true})');
        Utils.assertError(() => test.dispatch('P3'), 'Calling Promise.reject() from a synchronous action is not allowed. Please use an asynchronous action for this: @Action({async: true})');
        Utils.assertError(() => test.dispatch('P4'), 'Calling Promise.all() from a synchronous action is not allowed. Please use an asynchronous action for this: @Action({async: true})');
        Utils.assertError(() => test.dispatch('P5'), 'Calling Promise.race() from a synchronous action is not allowed. Please use an asynchronous action for this: @Action({async: true})');
        Utils.assertError(() => test.dispatch('T'), 'Calling setTimeout() from a synchronous action is not allowed. Please use an asynchronous action for this: @Action({async: true})');
        Utils.assertError(() => test.dispatch('I'), 'Calling setInterval() from a synchronous action is not allowed. Please use an asynchronous action for this: @Action({async: true})');

        assert.equal(test.y, undefined);
    });

    it('Asynchronous @Action can perform asynchronous operations (promises, timeout etc), when protector middleware is enabled', (done) => {

        @Store
        class TestClass {
            @State.byVal y;

            @Action SET(val) {
                this.y = val;
            }

            @Action({ async:true }) P1() {
                return new window.Promise(() => undefined);
            }
            @Action({ async:true }) P2() {
                return Promise.resolve(2);
            }
            @Action({ async:true }) P3() {
                return Promise.reject(2);
            }
            @Action({ async:true }) P4() {
                return Promise.all([]);
            }
            @Action({ async:true }) P5() {
                return Promise.race();
            }

            @Action({ async:true }) T() {
                setTimeout(() => this.dispatch('SET', 1));
            }

            @Action({ async:true }) I() {
                var test = () => this.dispatch('SET', 2);
                setInterval(test, 1000);
                clearInterval(test);
            }
        }

        var test = new TestClass({}, protectorMiddleware);

        test.dispatch('P1');
        test.dispatch('P2');
        test.dispatch('P3');
        test.dispatch('P4');
        test.dispatch('P5');
        test.dispatch('T');
        test.dispatch('I');

        assert.equal(test.y, undefined);

        setTimeout(() => {
            assert.equal(test.y, 1);
            done();
        });
    });

    it('Asynchronous @Action in a nested store can perform asynchronous operations (promises, timeout etc), when protector middleware is enabled', (done) => {

        @Store
        class TestClass {
            @State.byVal y;

            @Action SET(val) {
                this.y = val;
            }

            @Action({ async:true }) T() {
                setTimeout(() => this.dispatch('SET', 1));
            }
        }

        @Store
        class TestParent {
            @State.byRef(TestClass) child;
        }

        var test = new TestParent({}, protectorMiddleware);

        test.child.dispatch('T');

        assert.equal(test.child.y, undefined);

        setTimeout(() => {
            assert.equal(test.child.y, 1);
            done();
        });
    });

});
