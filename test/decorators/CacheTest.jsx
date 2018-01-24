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
import { SignalDispatcher, TaskQueue, Binder } from '@twist/core';

describe('@Cache decorator', () => {

    it('@Cache can only be used on a getter', () => {

        let error;
        try {
            class TestClass {
                x = 2;

                @Cache cachedValue() {
                    return 2 * this.x;
                }
            }
            assert(TestClass);
        }
        catch(e) {
            error = e;
        }

        assert.equal(error && error.message, '@Cache can only be applied on getters.');
    });

    it('@Cache cannot be used on a static getter', () => {

        let error;
        try {
            class TestClass {
                static x = 2;

                @Cache static get cachedValue() {
                    return 2 * TestClass.x;
                }
            }
            assert(TestClass);
        }
        catch(e) {
            error = e;
        }

        assert.equal(error && error.message, '@Cache cannot be used with static getters.');
    });


    it('@Cache can only be used in a Disposable class', () => {

        let error;
        try {
            class TestClass {
                x = 2;

                @Cache get cachedValue() {
                    return 2 * this.x;
                }
            }
            assert(TestClass);
        }
        catch(e) {
            error = e;
        }

        assert.equal(error && error.message, '@Cache can only be used on a Disposable class.');
    });

    it('Cache decorator - should update when binding changes', () => {

        let cacheUpdateCount = 0;

        class Test extends SignalDispatcher {

            constructor() {
                super();
                this.watch(() => this.cachedValue, v => this.value1 = v);
                this.watch(() => this.cachedValue + 1, v => this.value2 = v);
            }

            @Observable value = 4;

            @Cache
            get cachedValue() {
                cacheUpdateCount++;
                return 2 * this.value;
            }
        }

        let test = new Test();

        assert.equal(test.value1, 8);
        assert.equal(test.value2, 9);
        assert.equal(cacheUpdateCount, 1);

        test.value++;
        assert.equal(cacheUpdateCount, 1);
        TaskQueue.run();

        assert.equal(test.value1, 10);
        assert.equal(test.value2, 11);
        assert.equal(cacheUpdateCount, 2);

        test.dispose();
    });

    it('Cache decorator - should update eagerly when binding changes, if there\'s a Binder.mutator', () => {

        let mutator = {
            record: sinon.spy()
        };
        Binder.pushMutator(mutator);

        let cacheUpdateCount = 0;

        class Test extends SignalDispatcher {

            constructor() {
                super();
                this.watch(() => this.cachedValue, v => this.value1 = v);
                this.watch(() => this.cachedValue + 1, v => this.value2 = v);
            }

            @Observable value = 4;

            @Cache
            get cachedValue() {
                cacheUpdateCount++;
                return Math.min(2 * this.value, 10);
            }
        }

        let test = new Test();

        assert.equal(test.value1, 8);
        assert.equal(test.value2, 9);
        assert.equal(cacheUpdateCount, 1);

        test.value++;
        assert.equal(cacheUpdateCount, 2);
        TaskQueue.run();

        assert.equal(test.value1, 10);
        assert.equal(test.value2, 11);
        assert.equal(cacheUpdateCount, 2);

        test.value++;
        assert.equal(cacheUpdateCount, 3);
        TaskQueue.run();

        assert.equal(test.value1, 10);
        assert.equal(test.value2, 11);
        assert.equal(cacheUpdateCount, 3);

        assert.equal(mutator.record.callCount, 3);
        Binder.popMutator(mutator);

        test.dispose();
    });

});
