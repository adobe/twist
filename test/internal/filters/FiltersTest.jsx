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

/* global describe it */

import { Signal, Binder, TaskQueue } from '@twist/core';
import Filters from '../../../src/internal/filters/Filters';
import assert from 'assert';

describe('Bindings.Filters', () => {

    it('check for subscription support', (done) => {
        class TorqSubscriptionBinding {

            constructor(source) {
                this._source = source;
                this._refCount = 0;
            }

            _startSubscription() {
                this._subscription = this._source.subscribe(this._push);
            }

            _stopSubscription() {
                this._subscription.dispose();
                this._subscription = null;
            }

            ref() {
                if ((++this._refCount) === 1) {
                    this._startSubscription();
                }

                // We are reusing the same object as the binding, so we need to conform with the API of the Binder.
                // It is expecting us to have two properties: eventName and obj.
                return {
                    eventName: 'value',
                    obj: this,
                    dispose: this._deref
                };
            }

            // Using task to avoid killing the subscription when the value doesn't really change.
            // With task, we defer the actual stop until the frame is over. If any other binder happens to reach to this
            // generator, we will reuse its subscription even if the previous binder was already disposed.
            @Task
            _deref() {
                if ((--this._refCount) === 0) {
                    this._stopSubscription();
                }
            }

            @Bind
            _push(value) {
                this.value = value;
                Signal.trigger(this, 'value');
            }

        }

        let subscribtionDisposeCallCount = 0;

        class Generator {

            subscribe(cb) {
                Signal.on(this, 'push', cb);
                return {
                    dispose: () => {
                        ++subscribtionDisposeCallCount;
                        Signal.off(this, 'push', cb);
                    }
                };
            }

            push(value) {
                Signal.trigger(this, 'push', value);
            }

        }

        function CustomFilter(bindings, value) {
            if (value && (value instanceof Generator)) {
                let binding = value._torq_binding;
                if (!binding) {
                    binding = value._torq_binding = new TorqSubscriptionBinding(value);
                }
                // Increment the ref count.
                bindings.push(binding.ref());
                return binding;
            }
        }

        Filters.add(CustomFilter);

        let generator = new Generator;

        let binder = new Binder(() => generator);
        assert.equal(binder.previousValue, undefined);

        assert.equal(subscribtionDisposeCallCount, 0, 'The generator should not be disposed yet');

        generator.push('second value');

        // we need to wait until the promise queue runs.
        Promise.resolve(true).then(() => {
            TaskQueue.run();

            assert.equal(subscribtionDisposeCallCount, 0, 'Even after the first read, the generator should not be disposed yet');
            assert.equal(binder.previousValue, 'second value');

            binder.dispose();
            TaskQueue.run();

            assert.equal(subscribtionDisposeCallCount, 1, 'The generator should be disposed by now');

            Filters.remove(CustomFilter);

            done();
        }).catch(done);
    });

});
