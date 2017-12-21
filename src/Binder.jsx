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

import Filters from './internal/filters/Filters';
import BaseTaskQueue from './internal/queue/BaseTaskQueue';
import Logger from './internal/utils/Logger';

import Prototype from './decorators/Prototype';

import TaskQueue from './TaskQueue';
import Signal from './Signal';
import Disposable from './Disposable';
import objectId from './ObjectId';

var runFilters = Filters.filter;

// Using an unique object to identify binders that didn't run yet.
var FirstExecutionMarker = {};

// EmptyArray is an optimization - we only allocate a new array when needed.
var EmptyArray = [];
var EmptyArrayInUse = false;

const noop = function() {};

const wrapGetterFunction = function(fn) {
    if (typeof fn === 'function') {
        return fn;
    }
    if (typeof fn === 'object' && typeof fn.get === 'function') {
        return fn.get;
    }
    return noop;
};

const wrapSetterFunction = function(fn) {
    if (typeof fn === 'object' && typeof fn.set === 'function') {
        return fn.set;
    }
    return noop;
};

// Static methods in this file use Binder instead of this to make it possible to
// call the method directly without using a member property call.
@Prototype({
    FirstExecutionMarker
})
export default class Binder extends Disposable {

    static mutatorsStack = [];
    static active = null;
    static mutator = null;

    static pushMutator(mutator) {
        Binder.mutatorsStack.push(Binder.mutator);
        Binder.mutator = mutator;
    }

    static popMutator(mutator) {
        if (Binder.mutator === mutator) {
            Binder.mutator = Binder.mutatorsStack.pop();
        }
        else {
            console.error('Trying to pop a mutator that is not in the top of the stack');
        }
    }

    static run(bindings, fn, context) {
        // Save existing active binders and push the new one as active.
        var previous = Binder.active;
        Binder.active = bindings;

        var track = context && context.track;
        if (track) {
            bindings.track = context;
            Logger.groupStart('Running ' + (context.name || 'bindings'));
        }
        try {
            return fn.call(context);
        }
        finally {
            if (track) {
                Logger.groupEnd('Running ' + (context.name || 'binder'));
                bindings.track = null;
            }
            // Revert the active binder.
            Binder.active = previous;
        }
    }

    static recordEvent(obj, eventName) {
        var active = Binder.active;
        if (active) {
            // Use .track to identify the code that is invalidating a binding.
            var track = active.track;
            if (track) {
                let objName = objectId.get(obj) + '-' + (obj.constructor ? obj.constructor.name : 'Anonymous');
                Logger.log('Recording', objName, eventName);
            }
            active.push({ obj, eventName });
        }
    }

    static recordChange(obj, propertyName, newValue, oldValue) {
        Signal.trigger(obj, propertyName);

        var mutator = Binder.mutator;
        if (mutator) {
            mutator.record(obj, propertyName, newValue, oldValue);
        }
    }

    constructor(valueGetter, callback = noop, ignoreFirstRun = false, invalidate = TaskQueue, priority = 0, disposableParent = null) {
        super();

        this.previousValue = FirstExecutionMarker;
        this.bindings = [];
        this.dirty = !!ignoreFirstRun;
        this.disposableParent = disposableParent;

        this.valueGetter = wrapGetterFunction(valueGetter);
        this.set = wrapSetterFunction(valueGetter);
        this.callback = callback || noop;

        if (invalidate && invalidate instanceof BaseTaskQueue) {
            var queue = invalidate;
            var apply = this.apply.bind(this);
            invalidate = () => queue.push(apply, priority);
        }

        this.invalidate = () => {
            if (Binder.active === this) {
                // Don't invalidate when the Binder is currently running the valueGetter.
                return;
            }
            if (this.track) {
                var error = new Error();
                Error.captureStackTrace(error);
                Logger.log('change detected', window._signal, error.stack);
            }

            // When we have an invalidate method, then we allow the caller to handle it.
            if (invalidate) {
                this.dirty = true;
                invalidate();
            }
            else {
                // Otherwise just execute the update now.
                this.compute();
            }
        };

        if (!ignoreFirstRun) {
            this.compute();
        }
        else {
            this.get();
        }
    }

    removeBindings() {
        var bindings = this.bindings;
        if (bindings) {
            var invalidate = this.invalidate;
            for (var i = 0, l = bindings.length; i < l; ++i) {
                var binding = bindings[i];
                binding.ref.remove(invalidate);

                // There can be cases when reading a value needs to compute a subscription.
                // In that case we can dispose the subscription by adding the dispose method.
                if (binding.dispose) {
                    binding.dispose();
                }
            }
            this.bindings = null;
        }
    }

    dispose() {
        this.removeBindings();
        super.dispose();
    }

    update(value, invokeCallback = true) {
        var previousValue = this.previousValue;
        if (previousValue === FirstExecutionMarker || previousValue !== value) {
            this.previousValue = value;
            if (invokeCallback) {
                this.callback(value);
            }
            return true;
        }
    }

    apply() {
        if (!this.isDisposed && this.dirty) {
            return this.compute();
        }
    }

    _computeInnerValue() {
        // Remove all previous bindings.
        this.dirty = false;
        this.removeBindings();

        var disposableParent = this.disposableParent;
        if (disposableParent && disposableParent.isDisposed) {
            // No need to run this anymore, our parent is now disposed and cannot receive any of our events anyway.
            return;
        }

        // Note: We use an empty array by default to avoid allocating a new empty one every time we try to run.
        // This optimization makes the assumption that most expressions are non-bindable, so no events are necessary.
        // In that case the array can be used to collect future expressions. When the expression is actually bindable
        // we reset the EmptyArray to a new empty one.

        // However, it's possible that EmptyArray isn't empty, if there's a binding within a binding (e.g. this is
        // possible with the @Cache decorator). To be sure, we use a flag to check whether EmptyArray is already in use.
        // If it is, we have to create a new one, just to be on the safe side.
        if (EmptyArrayInUse) {
            EmptyArray = [];
        }

        EmptyArrayInUse = true;
        var bindings = EmptyArray;

        var value = Binder.run(bindings, this.valueGetter, this);
        value = runFilters(bindings, value);

        EmptyArrayInUse = false;

        if (!bindings.length) {
            return value;
        }

        // At this point, the empty array isn't empty any more, so make a new one :)
        EmptyArray = [];

        var invalidate = this.invalidate;
        for (let i = 0, l = bindings.length; i < l; ++i) {
            let binding = bindings[i];
            binding.ref = Signal.on(binding.obj, binding.eventName, invalidate);
        }

        // Remember the bindings so we can dispose of them when they change
        this.bindings = bindings;

        return value;
    }

    compute() {
        var value = this._computeInnerValue();
        return this.update(value, true);
    }

    get() {
        var value = this._computeInnerValue();
        this.update(value, false);
        return value;
    }

}
