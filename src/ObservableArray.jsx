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
import ArrayUtils from './internal/utils/ArrayUtils';

// Polyfill Array.find() if necessary, so that ObservableArray also implements it.
ArrayUtils.polyfill();

/**
 * @summary Wrapper for arrays so that they work with Twist's data binding.
 *
 * @description
 * A wrapper around the native JavaScript Array object to help Twist know when a change
 * occurs within the object.
 *
 * A few additional convenience methods are provided on top of the standard array methods
 */
export default class ObservableArray extends ObservableBase {
    constructor(base) {
        super();
        this.base = base || [];
    }

    /**
     * Proxy method for accessing array elements by index
     *
     * @param {number} i Index number of element to access
     */
    at(i) {
        Binder.active && Binder.recordEvent(this, 'change');
        return this.base[i];
    }

    /**
     * Sets the element at a given index to provided value
     *
     * @param {number} i The index of the element to set in the array
     * @param value The value to set the element as
     */
    setAt(i, value) {
        this.base[i] = value;
        Signal.trigger(this, 'change');
    }

    /**
     * Creates a clone of the native array
     */
    toArray() {
        Binder.active && Binder.recordEvent(this, 'change');
        return this.base.slice();
    }

    /**
     * Proxy method for array length
     */
    get length() {
        Binder.active && Binder.recordEvent(this, 'change');
        return this.base.length;
    }

    /**
     * Resizes the array to a desired length
     *
     * @param {number} length The desired length of the resized array
     */
    set length(length) {
        var prevLength = this.base.length;
        if (prevLength === length) {
            return;
        }
        this.base.length = length;
        Signal.trigger(this, 'change');
    }

    /**
     * Replaces the array wrapped by ObservableArray
     *
     * @param {Array} items The new array used to replace the ObservableArray's contents
     */
    swapItems(items) {
        // Change the items directly. Repeat collection will make the actual diff for us.
        this.base = items;

        // Make the collection run.
        Signal.trigger(this, 'change');
    }

    /**
     * Removes a given item from the array
     *
     * @param item The item to be removed from the array
     */
    removeItem(item) {
        var index = this.indexOf(item);
        if (index !== -1) {
            this.splice(index, 1);
        }
    }

    /**
     * Concatenate this array with other arrays, returning a new ObservableArray.
     *
     * @param {Array|ObservableArray...} otherArrays
     */
    concat(...otherArrays) {
        Binder.active && Binder.recordEvent(this, 'change');
        // To avoid creating unnecessary copies, directly access their base arrays.
        return new ObservableArray(this.base.concat(...otherArrays.map((arr) => {
            if (arr instanceof ObservableArray) {
                Binder.active && Binder.recordEvent(arr, 'change');
                return arr.base;
            }
            return arr;
        })));
    }

    /**
     * Concatenate this array with other arrays, returning a plain array.
     *
     * @param {Array|ObservableArray...} otherArrays
     */
    concatToArray(...otherArrays) {
        return this.concat.apply(this, otherArrays).base;
    }

    /**
     * Splice, returning the result a plain array.
     */
    spliceToArray() {
        return this.splice.apply(this, arguments).base;
    }

    /**
     * Slice, returning the result a plain array.
     */
    sliceToArray() {
        return this.slice.apply(this, arguments).base;
    }

    /**
     * Slice, returning the result a plain array.
     */
    mapToArray() {
        return this.map.apply(this, arguments).base;
    }

    /**
     * Slice, returning the result a plain array.
     */
    filterToArray() {
        return this.filter.apply(this, arguments).base;
    }

}

var ArrayPrototype = Array.prototype;
var ObservableArrayPrototype = ObservableArray.prototype;

var mutators = [ 'fill', 'pop', 'push', 'reverse', 'shift', 'unshift', 'splice', 'sort', 'copyWithin' ];

function wrapResult(result, caller) {
    if (result instanceof Array) {
        // Certain mutator methods (reverse, copyWithin, fill, sort) returns a reference to the mutated Array.
        // This preserves the equality relationship, and removes the need to create a new instance.
        if (caller.base === result) {
            return caller;
        }
        return new ObservableArray(result);
    }
    return result;
}

function createMethod(fn, mutator) {
    if (!mutator) {
        return function() {
            // Make sure we detect changes to the result of this method when the change event is recorded.
            Binder.active && Binder.recordEvent(this, 'change');
            return wrapResult(fn.apply(this.base, arguments), this);
        };
    }

    return function() {
        var result = fn.apply(this.base, arguments);
        Signal.trigger(this, 'change');
        return wrapResult(result, this);
    };
}

var props = Object.getOwnPropertyNames(ArrayPrototype);
for (var i = 0, l = props.length; i < l; ++i) {
    var key = props[i];
    if (ObservableArrayPrototype.hasOwnProperty(key)) {
        continue;
    }
    ObservableArrayPrototype[key] = createMethod(ArrayPrototype[key], mutators.indexOf(key) !== -1);
}
