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

/**
    State wrapper for ObservableArray
**/

import ObservableArray from '../../ObservableArray';
import ActionDispatcher from './ActionDispatcher';
import StoreSerializer from './StoreSerializer';


// We need this to override the getter/setter
var lengthProperty = Object.getOwnPropertyDescriptor(ObservableArray.prototype, 'length');

export default class StateObservableArray extends ObservableArray {

    _linkItem(index, item) {
        this._parent._linkStore(this._name + ':' + index, item);
    }

    _linkItems(start, end) {
        start = start || 0;
        end = end || this.length;
        // First, we unlink the previous items:
        for (let i = start; i < end; i++) {
            this._linkItem(i);
        }
        // Now we link the new items:
        for (let i = start; i < end; i++) {
            this._linkItem(i, this.at(i));
        }
        // Note: There are certain cases where it's safe to do a single interaction
        // (e.g. if you add to the beginning of the array, you can iterate backwards to be safe).
        // This solution works generally, and we can always optimize special cases in the future
        // if needed (though I doubt this will be an issue in practice)
    }

    get length() {
        return lengthProperty.get.call(this); /* call superclass getter */
    }

    set length(length) {
        if (!ActionDispatcher.active) {
            return StoreSerializer.ensureAction(this._parent, this._name + '.length', length);
        }

        var prevLength = this.base.length;
        lengthProperty.set.call(this, length); /* call superclass setter */

        if (prevLength > length) {
            this._linkItems(length, prevLength);
        }
    }

    swapItems(items) {
        if (!ActionDispatcher.active) {
            return StoreSerializer.ensureAction(this._parent, this._name + '.swapItems()', items);
        }

        var prevLength = this.base.length;

        super.swapItems(items);
        this._linkItems(0, Math.max(prevLength, items.length));
    }

    setAt(i, item) {
        if (!ActionDispatcher.active) {
            return StoreSerializer.ensureAction(this._parent, this._name + '.setAt()', i, item);
        }

        super.setAt(i, item);
        this._linkItem(i, item);
    }

    push() {
        if (!ActionDispatcher.active) {
            return StoreSerializer.ensureAction(this._parent, this._name + '.push()', ...arguments);
        }

        var oldLength = this.length;
        var length = super.push(...arguments);
        this._linkItems(oldLength, oldLength + arguments.length);
        return length;
    }

    pop() {
        if (!ActionDispatcher.active) {
            return StoreSerializer.ensureAction(this._parent, this._name + '.pop()', ...arguments);
        }

        var item = super.pop();
        this._linkItem(this.length);
        return item;
    }

    unshift() {
        if (!ActionDispatcher.active) {
            return StoreSerializer.ensureAction(this._parent, this._name + '.unshift()', ...arguments);
        }

        var length = super.unshift(...arguments);
        this._linkItems();
        return length;
    }

    shift() {
        if (!ActionDispatcher.active) {
            return StoreSerializer.ensureAction(this._parent, this._name + '.shift()', ...arguments);
        }

        var item = super.shift();
        this._linkItems(0, this.length + 1);
        return item;
    }

    splice() {
        if (!ActionDispatcher.active) {
            return StoreSerializer.ensureAction(this._parent, this._name + '.splice()', ...arguments);
        }

        var oldLength = this.length;
        var removedItems = super.splice(...arguments);
        this._linkItems(0, Math.max(oldLength, this.length));
        return removedItems;
    }

    fill(value, start, end) {
        if (!ActionDispatcher.active) {
            return StoreSerializer.ensureAction(this._parent, this._name + '.fill()', value, start, end);
        }

        super.fill(value, start, end);
        this._linkItems(start, end);
        return this;
    }

    reverse() {
        if (!ActionDispatcher.active) {
            return StoreSerializer.ensureAction(this._parent, this._name + '.reverse()');
        }

        super.reverse();
        this._linkItems();
        return this;
    }

    sort() {
        if (!ActionDispatcher.active) {
            // NOTE: We don't allow sort() even in a mutable store, because there's no way
            // to serialize the sort function.
            return StoreSerializer.ensureAction();
        }

        super.sort(...arguments);
        this._linkItems();
        return this;
    }

}
