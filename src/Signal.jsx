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

const _signals = Symbol('signals');
const _owner = Symbol('owner');

/** @private Needed by SignalDispatcher */
export var SignalsProperty = _signals;

export default class Signal {

    [_owner];

    constructor(owner) {
        this[_owner] = owner;
        this.handlers = [];
    }

    add(handler) {
        this.handlers.push(handler);
    }

    remove(handler) {
        var handlers = this.handlers;
        var index = handlers.indexOf(handler);
        if (index !== -1) {
            handlers.splice(index, 1);
        }
    }

    trigger() {
        var handlers = this.handlers.slice();
        var owner = this[_owner];
        for (var i = 0, l = handlers.length; i < l; ++i) {
            var handler = handlers[i];
            handler.apply(owner, arguments);
        }
    }

    triggerNoArgs() {
        var handlers = this.handlers.slice();
        var owner = this[_owner];
        for (var i = 0, l = handlers.length; i < l; ++i) {
            handlers[i].call(owner);
        }
    }

    triggerWithArray(args) {
        var handlers = this.handlers.slice();
        var owner = this[_owner];
        for (var i = 0, l = handlers.length; i < l; ++i) {
            var handler = handlers[i];
            handler.apply(owner, args);
        }
    }

    static trigger(obj, name) {
        var signals = obj[_signals];
        if (!signals || signals[_owner] !== obj) {
            return;
        }

        var signal = signals[name];
        if (!signal) {
            return;
        }

        signal.triggerWithArray(Array.prototype.slice.call(arguments, 2));

        return signal;
    }

    static triggerNoArgs(obj, name) {
        var signals = obj[_signals];
        if (!signals || signals[_owner] !== obj) {
            return;
        }

        var signal = signals[name];
        if (!signal) {
            return;
        }

        signal.triggerNoArgs();

        return signal;
    }

    static on(obj, name, handler) {
        var signals = obj[_signals];

        if (!signals || signals[_owner] !== obj) {
            signals = {};
            signals[_owner] = obj;
            Object.defineProperty(obj, _signals, {
                enumerable: false,
                configurable: false,
                value: signals
            });
        }

        var signal = signals[name];
        if (!signal) {
            signal = signals[name] = new Signal(obj);
        }

        signal.handlers.push(handler);

        return signal;
    }

    static off(obj, name, handler) {
        var signals = obj[_signals];
        if (!signals || signals[_owner] !== obj) {
            return;
        }

        var signal = signals[name];
        if (!signal) {
            return;
        }

        signal.remove(handler);
    }

    static listenTo(thisObj, obj, name, method) {
        var listening = thisObj._listening;
        if (!listening) {
            thisObj._listening = listening = [];
        }
        var handler = function() {
            method.apply(thisObj, arguments);
        };
        listening.push({ obj, name, method, handler });
        Signal.on(obj, name, handler);
    }

    static stopListening(thisObj, obj, name, method) {
        var listening = thisObj._listening;
        if (!listening) {
            return;
        }
        for (var i = 0, l = listening.length; i < l;) {
            var signal = listening[i];
            if ((obj && signal.obj !== obj)
                || (name && signal.name !== name)
                || (method && signal.method !== method)) {
                ++i;
                continue;
            }
            // Do not increment i, as we've just removed that listener.
            Signal.off(signal.obj, signal.name, signal.handler);
            listening.splice(i, 1);

            // Update the length to reflect the fact that we've removed one item.
            --l;
        }
    }
}
