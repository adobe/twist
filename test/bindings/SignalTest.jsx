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

import { Signal } from '../../index';
import assert from 'assert';

describe('Bindings.Signal', () => {

    it('trigger event', () => {
        let obj = { };
        let signaled = false;
        Signal.on(obj, 'event1', () => {
            signaled = true;
        });
        Signal.trigger(obj, 'event1');
        assert.ok(signaled, 'The signal was triggered.');

        // Adding this line to make sure we get full coverage for events that don't exist.
        Signal.trigger(obj, 'event2');
    });

    it('owner is respected', () => {
        let owner = {};
        let signal = new Signal(owner);
        let calledOwner;
        signal.add(function() {
            calledOwner = this;
        });
        signal.trigger();
        assert.equal(calledOwner, owner);
    });

    it('adding two events', () => {
        let obj = { };
        let signaled1 = false, signaled2 = false;
        Signal.on(obj, 'event1', () => signaled1 = true);
        Signal.on(obj, 'event2', () => signaled2 = true);

        Signal.trigger(obj, 'event1');
        assert.ok(signaled1, 'The first signal was triggered.');

        Signal.trigger(obj, 'event2');
        assert.ok(signaled2, 'The second signal was triggered.');
    });

    it('removing event name before signals were initialized', () => {
        // This test is needed to have full coverage for Signal.
        let obj = { };
        Signal.off(obj, 'event1', () => {
            // noop;
        });
    });

    it("removing event name that doesn't exist", () => {
        // This test is needed to have full coverage for Signal.
        let obj = { };
        Signal.on(obj, 'event1', () => {
            // noop;
        });
        Signal.off(obj, 'event2', () => {
            // noop;
        });
    });

    it('events are not enumerable', () => {
        let obj = { };
        let found = false;
        Signal.on(obj, 'event1', () => {
        });

        for (let i in obj) {
            assert(!i);
            found = true;
        }

        assert.ok(!found, 'The event should not create any enumerable properties on the object.');
    });

    it('trigger event with arguments', () => {
        let obj = { };
        let value = null;
        Signal.on(obj, 'event1', (...args) => {
            value = args;
        });

        Signal.trigger(obj, 'event1', 'oneValue');
        assert.deepEqual(value, [ 'oneValue' ], 'The signal was triggered.');
    });


    it('trigger should have no effect after removing event handler', () => {
        let obj = { };
        let signalCount = 0;
        let handler = () => {
            ++signalCount;
        };

        Signal.on(obj, 'event1', handler);
        Signal.trigger(obj, 'event1');
        assert.equal(signalCount, 1, 'The signal was triggered once.');

        // Removing the handler for this event.
        Signal.off(obj, 'event1', handler);

        Signal.trigger(obj, 'event1');
        assert.equal(signalCount, 1, 'The signal should not trigger second time.');
    });

    it('listenTo', () => {
        let obj1 = { }, obj2 = { };
        let signalCount = 0;
        let handler = () => {
            ++signalCount;
        };

        Signal.listenTo(obj1, obj2, 'event1', handler);
        Signal.trigger(obj2, 'event1');
        assert.equal(signalCount, 1, 'Should trigger the event once.');

        Signal.stopListening(obj1, obj2);
        Signal.trigger(obj2, 'event1');
        assert.equal(signalCount, 1, 'Should not trigger the event second time.');
    });

    it('stopListening on empty object', () => {
        let obj = {};
        Signal.stopListening(obj);
    });

    it('stopListening with name matching', () => {
        let obj1 = { }, obj2 = { };
        let signalCount = 0;
        let handler = () => {
            ++signalCount;
        };

        Signal.listenTo(obj1, obj2, 'event1', handler);
        Signal.trigger(obj2, 'event1');
        assert.equal(signalCount, 1, 'Should trigger the event once.');

        // Note we are bogusly removing obj3 to test that we preserve obj2.
        Signal.stopListening(obj1, obj2, 'event1');
        Signal.trigger(obj2, 'event1');
        assert.equal(signalCount, 1, 'Should not trigger the event second time.');
    });

    it('stopListening with name and handler matching', () => {
        let obj1 = { }, obj2 = { };
        let signalCount = 0;
        let handler = () => {
            ++signalCount;
        };

        Signal.listenTo(obj1, obj2, 'event1', handler);
        Signal.trigger(obj2, 'event1');
        assert.equal(signalCount, 1, 'Should trigger the event once.');

        // Note we are bogusly removing obj3 to test that we preserve obj2.
        Signal.stopListening(obj1, obj2, 'event1', handler);
        Signal.trigger(obj2, 'event1');
        assert.equal(signalCount, 1, 'Should not trigger the event second time.');
    });

    it('stopListening with no matching callback', () => {
        let obj1 = { }, obj2 = { }, obj3 = { };
        let signalCount = 0;
        let handler = () => {
            ++signalCount;
        };

        Signal.listenTo(obj1, obj2, 'event1', handler);
        Signal.trigger(obj2, 'event1');
        assert.equal(signalCount, 1, 'Should trigger the event once.');

        // Note we are bogusly removing obj3 to test that we preserve obj2.
        Signal.stopListening(obj1, obj3);
        Signal.trigger(obj2, 'event1');
        assert.equal(signalCount, 2, 'Should trigger the event second time as well.');

        Signal.trigger(obj3, 'event1');
        assert.equal(signalCount, 2, 'Should not trigger on the event from obj3.');
    });

});
