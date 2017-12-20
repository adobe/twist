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

import ObservableBase from './internal/ObservableBase';

import Signal from './Signal';
import Binder from './Binder';

/**
 * @summary Wrapper for sets so that they work with Twist's data binding.
 *
 * @description
 * A wrapper around the native JavaScript Set object to help Twist know when a change
 * occurs within the object.
 */
export default class ObservableSet extends ObservableBase {

    constructor(base = new Set) {
        super();
        this._swapItems(base);
    }

    /** @private */
    _swapItems(base) {
        if (base instanceof Set) {
            this.base = base;
        }
        else if (typeof base[Symbol.iterator] === 'function') {
            this.base = new Set(base);
        }
        else {
            throw new Error('ObservableSet expects either a Set object or an iterable object.');
        }
    }

    /**
     * Replaces the Set wrapped by ObservableSet
     *
     * @param {Set|Iterable} base The new Set or Iterable object used to replace the ObservableSet's contents
     */
    swapItems(base) {
        this._swapItems(base);
        Signal.trigger(this, 'change');
    }

    /**
     * Returns the number of values stored in the set
     */
    get size() {
        Binder.active && Binder.recordEvent(this, 'change');
        return this.base.size;
    }

    /**
     * Alias for size
     */
    get length() {
        return this.size;
    }
}

var SetPrototype = Set.prototype;
var ObservableSetPrototype = ObservableSet.prototype;

var mutators = [ 'add', 'clear', 'delete' ];
function createMethod(fn, mutator) {
    if (!mutator) {
        return function() {
            // Make sure we detect changes to the result of this method when the change event is recorded.
            Binder.active && Binder.recordEvent(this, 'change');
            return fn.apply(this.base, arguments);
        };
    }

    return function() {
        var result = fn.apply(this.base, arguments);
        Signal.trigger(this, 'change');
        return result;
    };
}

var props = Object.getOwnPropertyNames(SetPrototype);
for (var i = 0, l = props.length; i < l; ++i) {
    var key = props[i];
    if (ObservableSetPrototype.hasOwnProperty(key)) {
        continue;
    }
    ObservableSetPrototype[key] = createMethod(SetPrototype[key], mutators.indexOf(key) !== -1);
}
