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

import Disposable from './Disposable';
import Signal from './Signal';
import Binder from './Binder';
import CollectionBinder from './CollectionBinder';
import TaskQueue from './TaskQueue';
import { SignalsProperty } from './Signal';

const noop = function() {};

export default class SignalDispatcher extends Disposable {

    watch(valueGetter, callback = noop, ignoreFirstRun = false, invalidate = TaskQueue, priority = this.$_depth || 0) {
        if (valueGetter instanceof Array) {
            valueGetter = () => valueGetter.map((fn) => fn());
            callback = (result) => callback.apply(null, result);
        }
        return this.link(new Binder(valueGetter, callback, ignoreFirstRun, invalidate, priority, this));
    }

    watchCollection(valueGetter, callback = noop, ignoreFirstRun = false, invalidate = TaskQueue, priority = this.$_depth || 0) {
        return this.link(new CollectionBinder(valueGetter, callback, ignoreFirstRun, invalidate, priority, this));
    }

    defineObservable(key, defaultValue) {
        if (this.hasOwnProperty(key)) {
            this[key] = defaultValue;
            return;
        }

        var hiddenKey = Symbol(key);
        this[hiddenKey] = defaultValue;

        var self = this;

        Object.defineProperty(this, key, {
            configurable: true,
            enumerable: false,
            get() {
                Binder.active && Binder.recordEvent(self, key);
                return self[hiddenKey];
            },
            set(value) {
                var oldValue = self[hiddenKey];
                if (oldValue === value) {
                    return;
                }
                self[hiddenKey] = value;
                Binder.recordChange(self, key, value, oldValue);
            }
        });
    }

    dispose() {
        this.stopListening();
        super.dispose();
    }

    trigger(name, ...args) {
        if (!this.hasOwnProperty(SignalsProperty)) {
            return;
        }
        var signals = this[SignalsProperty];
        var signal = signals[name];
        if (!signal) {
            return;
        }
        signal.trigger.apply(signal, args);
    }

    on(name, handler) {
        return Signal.on(this, name, handler);
    }

    off(name, handler) {
        return Signal.off(this, name, handler);
    }

    listenTo(obj, name, method) {
        return Signal.listenTo(this, obj, name, method);
    }

    stopListening(obj, name, method) {
        return Signal.stopListening(this, obj, name, method);
    }

}
