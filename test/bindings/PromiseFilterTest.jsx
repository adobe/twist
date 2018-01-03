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

import { Binder, TaskQueue } from '../../index';
import assert from 'assert';

class Deferred {
    constructor() {
        this.promise = new Promise((resolve, reject) => this._deferredApi = { resolve, reject });
    }

    resolve(value) {
        this._deferredApi.resolve(value);
    }

    reject(value) {
        this._deferredApi.reject(value);
    }
}


describe('Bindings.PromiseFilter', () => {

    it('check for promises', (done) => {
        class X {
            @Observable data;
        }
        let x = new X;
        let signaled = 0;
        let expectedValue = undefined;

        let deferred = new Deferred;
        x.data = deferred.promise;

        new Binder(() => x.data, (value) => {
            assert.equal(value, expectedValue);
            ++signaled;
        });

        TaskQueue.run();
        assert.equal(signaled, 1, 'The binder callback should trigger.');

        expectedValue = 'first value';
        deferred.resolve(expectedValue);

        // we need to wait until the promise queue runs.
        Promise.resolve(true).then(() => {
            TaskQueue.run();
            assert.equal(signaled, 2, 'The binder callback should trigger the second time.');

            done();
        }).catch(done);
    });

    it('check for promises in JSX', (done) => {
        let deferred = new Deferred;

        let test = new Binder(() => deferred.promise);
        assert.equal(test.previousValue, undefined);

        deferred.resolve('second value');

        // we need to wait until the promise queue runs.
        Promise.resolve(true).then(() => {
            TaskQueue.run();

            assert.equal(test.previousValue, 'second value');

            test.dispose();
            done();
        }).catch(done);
    });

    it('check for pre-resolved promises in JSX', (done) => {
        let promise = Promise.resolve('first value');

        let test = new Binder(() => promise);

        // We need to take a look at the value. The callback we pass to "then" is not going to resolve in the same callstack.
        assert.equal(test.previousValue, undefined);

        // We need to wait until the promise queue runs.
        Promise.resolve(true).then(() => {
            TaskQueue.run();

            assert.equal(test.previousValue, 'first value');

            test.dispose();
            done();
        }).catch(done);
    });

    it('check for rejected promises in JSX', (done) => {
        let deferred = new Deferred;

        let test = new Binder(() => deferred.promise);
        assert.equal(test.previousValue, undefined);

        deferred.reject(new Error('reasons'));

        // we need to wait until the promise queue runs.
        Promise.resolve(true).then(() => {
            TaskQueue.run();

            assert.equal(test.previousValue, undefined);

            test.dispose();
            done();
        }).catch(done);
    });

});
