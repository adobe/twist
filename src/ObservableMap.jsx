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
 * @summary Wrapper for maps so that they work with Twist's data binding.
 *
 * @description
 * A wrapper around the native JavaScript Map object to help Twist know when a change
 * occurs within the object.
 */
export default class ObservableMap extends ObservableBase {

    constructor(base = new Map) {
        super();
        this._swapItems(base);
    }

    /** @private */
    _swapItems(base) {
        if (base instanceof Map) {
            this.base = base;
        }
        else {
            this.base = new Map;
            for (let key in base) {
                this.base.set(key, base[key]);
            }
        }
    }

    /**
     * Replaces the Map wrapped by ObservableMap
     *
     * @param {Map|Object} items The new Map or Object used to replace the ObservableMap's contents
     */
    swapItems(items) {
        this._swapItems(items);
        Signal.trigger(this, 'change');
    }

    /**
     * Returns a boolean for the presence of a given key
     *
     * @param key The key to check
     */
    has(key) {
        if (Binder.active) {
            Binder.recordEvent(this, '' + key);
            Binder.recordEvent(this, 'change');
        }
        return this.base.has(key);
    }

    /**
     * Returns the value stored for a given key
     *
     * @param key The key to retrieve the value of
     */
    get(key) {
        if (Binder.active) {
            Binder.recordEvent(this, '' + key);
            Binder.recordEvent(this, 'change');
        }
        return this.base.get(key);
    }

    /**
     * Creates a new entry in the map
     *
     * @param key The key of the new entry
     * @param value The value of the new entry
     * @returns {ObservableMap} The map itself (allowing you to chain calls to set).
     */
    set(key, value) {
        if (this.base.get(key) === value) {
            return;
        }
        this.base.set(key, value);
        Signal.trigger(this, '' + key);
        Signal.trigger(this, 'change');
        return this;
    }

    /**
     * Removes all entries from the map
     */
    clear() {
        var keys = [];
        this.base.forEach((value, key) => keys.push(key));
        this.base.clear();

        keys.forEach((key) => Signal.trigger(this, '' + key));
        Signal.trigger(this, 'change');
    }

    /**
     * Deletes the entry under a given key
     * @param key The key to be removed
     * @returns {Boolean} Whether the delete was successful
     */
    delete(key) {
        let success = this.base.delete(key);

        Signal.trigger(this, '' + key);
        Signal.trigger(this, 'change');
        return success;
    }

    /**
     * Returns the number of keys in the map
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


var MapPrototype = Map.prototype;
var ObservableMapPrototype = ObservableMap.prototype;

function createMethod(fn) {
    return function() {
        // Make sure we detect changes to the result of this method when the change event is recorded.
        Binder.active && Binder.recordEvent(this, 'change');
        return fn.apply(this.base, arguments);
    };
}

var props = Object.getOwnPropertyNames(MapPrototype);
for (var i = 0, l = props.length; i < l; ++i) {
    var key = props[i];
    if (!ObservableMapPrototype.hasOwnProperty(key)) {
        ObservableMapPrototype[key] = createMethod(MapPrototype[key]);
    }
}
