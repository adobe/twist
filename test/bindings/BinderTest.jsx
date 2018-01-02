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
import sinon from 'sinon';

describe('Bindings.Binder', () => {

    it('detect property change - bind to function', () => {
        class X {
            @Observable data;
        }
        let x = new X;
        x.data = 'first value';

        let callback = sinon.spy();
        new Binder(() => x.data, callback);

        assert.equal(callback.callCount, 1, 'The binder callback should trigger.');
        assert.equal(callback.getCall(0).args[0], 'first value');

        x.data = 'second value';
        TaskQueue.run();

        assert.equal(callback.callCount, 2, 'The binder callback should trigger a second time after we push a new item.');
        assert.equal(callback.getCall(1).args[0], 'second value');
    });

    it('detect property change - bind to getter/setter', () => {
        class X {
            @Observable data;
        }
        let x = new X;
        x.data = 'first value';

        let callback = sinon.spy();
        new Binder({
            get() {
                return x.data;
            },
            set(v) {
                x.data = v;
            }
        }, callback);

        assert.equal(callback.callCount, 1, 'The binder callback should trigger.');
        assert.equal(callback.getCall(0).args[0], 'first value');

        x.data = 'second value';
        TaskQueue.run();

        assert.equal(callback.callCount, 2, 'The binder callback should trigger a second time after we push a new item.');
        assert.equal(callback.getCall(1).args[0], 'second value');
    });

    it('detect property change - without first run', () => {
        class X {
            @Observable data;
        }

        let x = new X;
        x.data = 'first value';

        let callback = sinon.spy();
        new Binder(() => x.data, callback, true);

        assert.equal(callback.callCount, 0, 'The binder callback should not trigger the first time.');

        x.data = 'second value';
        TaskQueue.run();

        assert.equal(callback.callCount, 1, 'The binder callback should trigger the first time time after we push a new item.');
        assert.equal(callback.getCall(0).args[0], 'second value');
    });

    it('previous bindings should be disposed when a value changes', () => {
        let unobservable = 1;

        class X {
            @Observable condition = true;
            @Observable value1 = 'true';
            @Observable value2 = 'false';
        }
        let x = new X;

        let callback = sinon.spy();
        new Binder(() => x.condition ? x.value1 : (x.value2 + unobservable), callback);

        assert.equal(callback.callCount, 1);
        assert.equal(callback.getCall(0).args[0], 'true');

        x.condition = false;
        TaskQueue.run();

        assert.equal(callback.callCount, 2);
        assert.equal(callback.getCall(1).args[0], 'false1');

        x.value1 = 'very true';
        unobservable = 2;
        TaskQueue.run();

        // Since we only changed an observable in the if-clause, and an unobservable value,
        // this should NOT cause the watch to trigger. If it does, that indicates the previous
        // binders not being removed.
        assert.equal(callback.callCount, 2);
    });

    it('previous bindings should be disposed when a value changes', () => {
        let unobservable = 1;

        class X {
            @Observable condition = true;
            @Observable value1 = 'true';
            @Observable value2 = 'false';
        }
        let x = new X;

        let callback = sinon.spy();
        new Binder(() => x.condition ? x.value1 : (x.value2 + unobservable), callback);

        assert.equal(callback.callCount, 1);
        assert.equal(callback.getCall(0).args[0], 'true');

        x.condition = false;
        TaskQueue.run();

        assert.equal(callback.callCount, 2);
        assert.equal(callback.getCall(1).args[0], 'false1');

        x.value1 = 'very true';
        unobservable = 2;
        TaskQueue.run();

        // Since we only changed an observable in the if-clause, and an unobservable value,
        // this should NOT cause the watch to trigger. If it does, that indicates the previous
        // binders not being removed.
        assert.equal(callback.callCount, 2);
    });

    it('binding to a promise - external to watch', () => {

        let resolver;
        let p = new Promise(resolve => resolver = resolve);

        let callback = sinon.spy();
        new Binder(() => p, callback);

        assert.equal(callback.callCount, 1);
        assert.equal(callback.getCall(0).args[0], undefined);

        resolver(10);
        TaskQueue.run();

        // TODO: Binding to promise doesn't work right now - expect it to resolve
        assert.equal(callback.callCount, 1);
        // assert.equal(callback.getCall(1).args[0], 10);
    });

    it('binding to a promise - constructed inside watch', () => {

        let callback = sinon.spy();
        new Binder(() => Promise.resolve(10), callback);

        // TODO: Binding to promise doesn't work right now - expect it to resolve
        assert.equal(callback.callCount, 1);
        assert.equal(callback.getCall(0).args[0], undefined);
    });

    it('mutation within a binder', () => {
        class X {
            @Observable value = 0;
        }
        let x = new X;

        let callback = sinon.spy();
        new Binder(() => x.value++, callback);

        assert.equal(callback.callCount, 1);
        assert.equal(callback.getCall(0).args[0], 0);
        assert.equal(x.value, 1);

        // Should not continue to update value
        TaskQueue.run();
        assert.equal(callback.callCount, 1);
        assert.equal(x.value, 1);

        x.value = 10;
        TaskQueue.run();
        assert.equal(callback.callCount, 2);
        assert.equal(callback.getCall(1).args[0], 10);
        assert.equal(x.value, 11);

        // Should not continue to update value
        TaskQueue.run();
        assert.equal(callback.callCount, 2);
        assert.equal(x.value, 11);
    });

    it('mutation within a binder - no invalidate', () => {
        class X {
            @Observable value = 0;
        }
        let x = new X;

        let callback = sinon.spy();
        new Binder(() => x.value++, callback, false, null);

        assert.equal(callback.callCount, 1);
        assert.equal(callback.getCall(0).args[0], 0);
        assert.equal(x.value, 1);

        // Should not continue to update value
        TaskQueue.run();
        assert.equal(callback.callCount, 1);
        assert.equal(x.value, 1);

        x.value = 10;
        TaskQueue.run();
        assert.equal(callback.callCount, 2);
        assert.equal(callback.getCall(1).args[0], 10);
        assert.equal(x.value, 11);

        // Should not continue to update value
        TaskQueue.run();
        assert.equal(callback.callCount, 2);
        assert.equal(x.value, 11);
    });

    it('binder without callback should not crash', () => {
        class X {
            @Observable data;
        }
        let x = new X;

        new Binder();
        new Binder(() => x.data);
        new Binder(() => x.data, null);

        x.data = 'second value';
        TaskQueue.run();
        // No crash
    });

    it('cannot pop with no mutators', () => {
        sinon.spy(console, 'error');

        Binder.popMutator();
        assert.equal(console.error.getCall(0).args[0], 'Trying to pop a mutator that is not in the top of the stack');

        let mutator = {};
        Binder.pushMutator(mutator);
        Binder.popMutator({});
        assert.equal(console.error.getCall(1).args[0], 'Trying to pop a mutator that is not in the top of the stack');

        Binder.popMutator(mutator);
        assert.equal(console.error.callCount, 2);
        console.error.restore();
    });

    it('can push and pop mutators', () => {
        class X {
            @Observable data = 'first';
        }
        let x = new X;

        let mutator1 = {
            record: sinon.spy()
        };

        let mutator2 = {
            record: sinon.spy()
        };

        Binder.pushMutator(mutator1);

        x.data = 'second';
        assert.equal(mutator1.record.callCount, 1);
        assert.equal(mutator1.record.getCall(0).args[0], x);
        assert.equal(mutator1.record.getCall(0).args[1], 'data');
        assert.equal(mutator1.record.getCall(0).args[2], 'second');
        assert.equal(mutator1.record.getCall(0).args[3], 'first');

        Binder.pushMutator(mutator2);
        x.data = 'third';
        assert.equal(mutator1.record.callCount, 1);
        assert.equal(mutator2.record.callCount, 1);
        assert.equal(mutator2.record.getCall(0).args[0], x);
        assert.equal(mutator2.record.getCall(0).args[1], 'data');
        assert.equal(mutator2.record.getCall(0).args[2], 'third');
        assert.equal(mutator2.record.getCall(0).args[3], 'second');

        Binder.popMutator(mutator2);
        x.data = 'fourth';
        assert.equal(mutator2.record.callCount, 1);
        assert.equal(mutator1.record.callCount, 2);
        assert.equal(mutator1.record.getCall(1).args[0], x);
        assert.equal(mutator1.record.getCall(1).args[1], 'data');
        assert.equal(mutator1.record.getCall(1).args[2], 'fourth');
        assert.equal(mutator1.record.getCall(1).args[3], 'third');

        Binder.popMutator(mutator1);
        x.data = 'fifth';
        assert.equal(mutator2.record.callCount, 1);
        assert.equal(mutator1.record.callCount, 2);
    });

});
