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
import sinon from 'sinon';

import { Signal } from '@twist/core';

describe('Thunk Middleware', () => {

    it('Thunk middleware should be enabled by default', () => {

        var THUNK_ACTION = function(store) {
            store.dispatch('INCR');
        };

        @Store
        class TestStore {
            @State.byVal x;

            @Action INCR() {
                this.x++;
            }
        }

        var test = new TestStore({ x: 2 });

        // Check for data binding
        var changed = false;
        Signal.on(test, 'x', () => changed = true);
        assert.equal(test.x, 2);

        test.dispatch(THUNK_ACTION);

        assert(changed, 'value change event was triggered');
        assert.equal(test.x, 3);
    });

    it('Can disable Thunk middleware', () => {

        var THUNK_ACTION = function(store) {
            store.dispatch('INCR');
        };

        @Store
        class TestStore {
            @State.byVal x;

            @Action INCR() {
                this.x++;
            }
        }

        var test = new TestStore({ x: 2 }, [], false);

        assert.throws(() => test.dispatch(THUNK_ACTION), Error, 'Action name must be a string');
    });

    it('Can dispatch thunk middleware to a sub-store', () => {

        var THUNK_ACTION = function(store) {
            store.dispatch('INCR');
        };

        @Store
        class TestStore {
            @State.byVal x;

            @Action INCR() {
                this.x++;
            }
        }

        @Store
        class ParentStore {
            @State.byRef(TestStore) test;
        }

        var test = new ParentStore({ test: { x: 2 } });

        // Check for data binding
        var changed = false;
        Signal.on(test.test, 'x', () => changed = true);
        assert.equal(test.test.x, 2);

        test.test.dispatch(THUNK_ACTION);

        assert(changed, 'value change event was triggered');
        assert.equal(test.test.x, 3);
    });

    it('Can dispatch thunk middleware - asynchronous action with setTimeout', done => {

        var THUNK_ACTION = function(store) {
            setTimeout(() => store.dispatch('INCR'));
        };

        @Store
        class TestStore {
            @State.byVal x;

            @Action INCR() {
                this.x++;
            }
        }

        var test = new TestStore({ x: 2 });

        test.watch(() => test.x, () => {
            assert.equal(test.x, 3);
            done();
        }, true);

        test.dispatch(THUNK_ACTION);
    });

    it('Can dispatch thunk middleware - asynchronous action with Promises', done => {

        var THUNK_ACTION = function(store, add1, add2) {
            return Promise.resolve(2)
                .then(() => new Promise(resolve => resolve(2)))
                .then(() => store.dispatch('INCR', add1, add2));
        };

        @Store
        class TestStore {
            @State.byVal x;

            @Action INCR(add1, add2) {
                this.x += add1;
                this.x += add2;
            }
        }

        var test = new TestStore({ x: 2 });

        test.watch(() => test.x, () => {
            assert.equal(test.x, 5);
            done();
        }, true);

        test.dispatch(THUNK_ACTION, 1, 2);
    });

    it('Can dispatch thunk middleware - asynchronous action with Promises, where action handler returns a promise', done => {

        var THUNK_ACTION = function(store, add1, add2) {
            return Promise.resolve(2)
                .then(() => new Promise(resolve => resolve(2)))
                .then(() => store.dispatch('INCR', add1, add2));
        };

        @Store
        class TestStore {
            @State.byVal x;

            @Action INCR(add1, add2) {
                this.x += add1;
                this.x += add2;
            }
        }

        var test = new TestStore({ x: 2 });

        test.dispatch(THUNK_ACTION, 1, 2).then(() => {
            assert.equal(test.x, 5);
            done();
        });
    });

    it('Can dispatch thunk middleware - asynchronous action with @Action({async: true})', done => {

        @Store
        class TestStore {
            @State.byVal x;

            @Action({ async: true }) THUNK_ACTION(add1, add2) {
                setTimeout(() => this.dispatch('INCR', add1, add2));
            }

            @Action INCR(add1, add2) {
                this.x += add1;
                this.x += add2;
            }
        }

        var test = new TestStore({ x: 2 });

        test.watch(() => test.x, () => {
            assert.equal(test.x, 5);
            done();
        }, true);

        test.dispatch('THUNK_ACTION', 1, 2);
    });

    it('Can dispatch thunk middleware - asynchronous action with @Action({async: true}), where action handler returns a promise', done => {

        @Store
        class TestStore {
            @State.byVal x;

            @Action({ async: true }) THUNK_ACTION(add1, add2) {
                return Promise.resolve(2)
                    .then(() => new Promise(resolve => resolve(2)))
                    .then(() => this.dispatch('INCR', add1, add2));
            }

            @Action INCR(add1, add2) {
                this.x += add1;
                this.x += add2;
            }
        }

        var test = new TestStore({ x: 2 });

        test.dispatch('THUNK_ACTION', 1, 2).then(() => {
            assert.equal(test.x, 5);
            done();
        });
    });

    it('Asynchronous actions can only be dispatched directly - they do not propagate', () => {

        sinon.spy(console, 'warn');

        @Store
        class NestedStore {
            @State.byVal x;

            @Action({ async: true }) THUNK_ACTION(add1, add2) {
                this.dispatch('INCR', add1, add2);
            }

            @Action INCR(add1, add2) {
                this.x += add1;
                this.x += add2;
            }
        }

        @Store
        class ParentStore {
            @State.byRef(NestedStore) child;
        }

        var test = new ParentStore({ child: { x: 2 } });

        test.dispatch('THUNK_ACTION', 1, 2);
        assert.equal(test.child.x, 2, 'Async action should be ignored when the action is propagating');

        assert(console.warn.calledWith('Ignoring an asynchronous handler for action "THUNK_ACTION" while propagating. Asynchronous actions can only be dispatched directly to the target store.'));

        test.child.dispatch('THUNK_ACTION', 1, 2);
        assert.equal(test.child.x, 5, 'Async action should be applied when on the same store we dispatch to');

        test.dispatch('THUNK_ACTION', 1, 2);

        console.warn.restore();
    });

});
