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

import { ObservableArray, SignalDispatcher, TaskQueue } from '@twist/core';
import assert from 'assert';
import sinon from 'sinon';

class Data {
    @Observable x = 1;
    @Observable y = 2;
}

describe('Utils.SignalDispatcher', () => {

    it('call watch() on an observable', () => {
        let data = new Data;
        let dispatcher = new SignalDispatcher();
        let callback = sinon.spy();

        dispatcher.watch(() => data.x, callback);
        dispatcher.watch(() => data.x); // should work with a noop

        assert.equal(callback.callCount, 1);
        assert.equal(callback.getCall(0).args[0], 1);

        // Changing to different value should trigger watch
        data.x = 2;
        TaskQueue.run();

        assert.equal(callback.callCount, 2);
        assert.equal(callback.getCall(1).args[0], 2);

        // Changing to same value should not trigger watch
        data.x = 2;
        TaskQueue.run();

        assert.equal(callback.callCount, 2);
    });

    it('call watch() on an observable - ignore first run', () => {
        let data = new Data;
        let dispatcher = new SignalDispatcher();
        let callback = sinon.spy();

        dispatcher.watch(() => data.x, callback, true);

        assert.equal(callback.callCount, 0);

        // Changing to different value should trigger watch
        data.x = 2;
        TaskQueue.run();

        assert.equal(callback.callCount, 1);
        assert.equal(callback.getCall(0).args[0], 2);
    });

    it('call watchCollection() on an observable array', () => {
        let data = new ObservableArray;
        let dispatcher = new SignalDispatcher();
        let callback = sinon.spy();

        dispatcher.watchCollection(() => data, callback);
        dispatcher.watchCollection(() => data); // should work with a noop

        assert.equal(callback.callCount, 1);
        assert.equal(callback.getCall(0).args[0], data.base); // TODO: Why do we pass the base here, doesn't make sense...

        // Changing the array should trigger watch
        data.push(2);
        data.push(3);
        TaskQueue.run();

        assert.equal(callback.callCount, 2);
        assert.equal(callback.getCall(1).args[0], data.base);

        // Watch shouldn't trigger if nothing really changed
        data.length = data.length;
        TaskQueue.run();

        assert.equal(callback.callCount, 2);
    });

    it('call watchCollection() on an observable array - ignore first run', () => {
        let data = new ObservableArray;
        let dispatcher = new SignalDispatcher();
        let callback = sinon.spy();

        dispatcher.watchCollection(() => data, callback, true);

        assert.equal(callback.callCount, 0);

        // Changing the array should trigger watch
        data.push(2);
        TaskQueue.run();

        assert.equal(callback.callCount, 1);
        assert.equal(callback.getCall(0).args[0], data.base);
    });

    it('watches should not trigger after disposing watch', () => {
        let data = new Data;
        let dispatcher = new SignalDispatcher();
        let callback = sinon.spy();

        let watch = dispatcher.watch(() => data.x, callback);

        assert.equal(callback.callCount, 1);
        assert.equal(callback.getCall(0).args[0], 1);

        // Changing to different value should trigger watch
        watch.dispose();
        data.x = 2;
        TaskQueue.run();

        // Not triggered
        assert.equal(callback.callCount, 1);
    });

    it('watches should not trigger after disposing signal dispatcher', () => {
        let data = new Data;
        let dispatcher = new SignalDispatcher();
        let callback = sinon.spy();

        dispatcher.watch(() => data.x, callback);

        assert.equal(callback.callCount, 1);
        assert.equal(callback.getCall(0).args[0], 1);

        // Changing to different value should trigger watch
        dispatcher.dispose();
        data.x = 2;
        TaskQueue.run();

        // Not triggered
        assert.equal(callback.callCount, 1);
    });

    it('should be able define an observable and watch it', () => {
        let dispatcher = new SignalDispatcher();
        dispatcher.defineObservable('x', 2);
        let callback = sinon.spy();

        dispatcher.watch(() => dispatcher.x, callback);

        assert.equal(callback.callCount, 1);
        assert.equal(callback.getCall(0).args[0], 2);

        // Changing to different value should trigger watch
        dispatcher.x = 4;
        TaskQueue.run();

        assert.equal(callback.callCount, 2);
        assert.equal(callback.getCall(1).args[0], 4);

        // Changing to the same value should not trigger watch
        dispatcher.x = 4;
        TaskQueue.run();

        assert.equal(callback.callCount, 2);

        // Defining an observable again should just update its value
        dispatcher.defineObservable('x', 10);
        TaskQueue.run();

        assert.equal(dispatcher.x, 10);
        assert.equal(callback.callCount, 3);
        assert.equal(callback.getCall(2).args[0], 10);
    });

    it('should be able to trigger an event and listen for it with on/off', () => {
        let dispatcher = new SignalDispatcher();
        dispatcher.trigger('event'); // Triggering an event shouldn't do anything, if no listeners
        let callback = sinon.spy();
        dispatcher.on('event', callback);

        assert.equal(callback.callCount, 0);

        // Trigger an event should call listener
        dispatcher.trigger('event', 'arg1', 'arg2');

        assert.equal(callback.callCount, 1);
        assert.equal(callback.getCall(0).args[0], 'arg1');
        assert.equal(callback.getCall(0).args[1], 'arg2');

        // Trigger a different event should not call listener
        dispatcher.trigger('another_event', 'arg1', 'arg2');

        assert.equal(callback.callCount, 1);

        // Stop listening, listener should no longer be called
        dispatcher.off('event', callback);
        dispatcher.trigger('event', 'arg1', 'arg2');

        assert.equal(callback.callCount, 1);

        // Calling off again should have no effect
        dispatcher.off('event', callback);
    });

    it('should be able to trigger an event and listen for it with listenTo/stopListening', () => {
        let dispatcher = new SignalDispatcher();
        let listener = new SignalDispatcher();

        let callback = sinon.spy();
        listener.listenTo(dispatcher, 'event', callback);

        assert.equal(callback.callCount, 0);

        // Trigger an event should call listener
        dispatcher.trigger('event', 'arg1', 'arg2');

        assert.equal(callback.callCount, 1);
        assert.equal(callback.getCall(0).args[0], 'arg1');
        assert.equal(callback.getCall(0).args[1], 'arg2');

        // Trigger a different event should not call listener
        dispatcher.trigger('another_event', 'arg1', 'arg2');

        assert.equal(callback.callCount, 1);

        // Trigger event on a different object should not call listener
        listener.trigger('event', 'arg1', 'arg2');

        assert.equal(callback.callCount, 1);

        // Stop listening, listener should no longer be called
        listener.stopListening(dispatcher, 'event', callback);
        dispatcher.trigger('event', 'arg1', 'arg2');

        assert.equal(callback.callCount, 1);

        // Calling stopListening again should have no effect
        listener.stopListening(dispatcher, 'event', callback);
    });

    it('dispose should call stopListening', () => {
        let dispatcher = new SignalDispatcher();
        let listener = new SignalDispatcher();

        let callback = sinon.spy();
        listener.listenTo(dispatcher, 'event', callback);

        assert.equal(callback.callCount, 0);

        // Trigger an event should call listener
        dispatcher.trigger('event', 'arg1', 'arg2');

        assert.equal(callback.callCount, 1);
        assert.equal(callback.getCall(0).args[0], 'arg1');
        assert.equal(callback.getCall(0).args[1], 'arg2');

        // Dispose should remove listener
        listener.dispose();

        dispatcher.trigger('event', 'arg1', 'arg2');

        assert.equal(callback.callCount, 1);
    });

});
