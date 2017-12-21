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

import ActionDispatcher from './ActionDispatcher';
import Store from './Store';

/**
 * Utilities for serializing a store, so we can reconstruct it without knowing its type.
 * Stores register with the StoreSerializer, so we're able to match a store name back to its class.
 *
 * In the future we could update so we don't need a map, since the @State.XXX properties tell us what
 * to serialize to. It's a bit trickier when you're just pushing one item onto an array though (this doesn't
 * go through the fromJSON method), so we'd need some more refactoring to support that. This is just an
 * implementation detail though - clients don't need to worry about this.
 */
export default class StoreSerializer {

    static _nameToClass = {};

    static register(classObj) {
        // IE11 does not support Function#name, so fallback in this case
        var className = classObj.prototype.constructor.name || 'Unknown';
        var lookupName = className;
        var count = 1;
        while (StoreSerializer._nameToClass[lookupName]) {
            lookupName = className + count++;
        }

        StoreSerializer._nameToClass[lookupName] = classObj;
        classObj.prototype.__classLookupName = lookupName;
    }

    static lookup(lookupName) {
        return StoreSerializer._nameToClass[lookupName];
    }

    static valueToJSON(value) {
        if (value && value instanceof Store) {
            return {
                className: value.__classLookupName,
                json: value.toJSON()
            };
        }

        return value;
    }

    static valueFromJSON(value) {
        if (value && value.className && value.json) {
            var ClassObj = StoreSerializer.lookup(value.className);
            var obj = new ClassObj;
            obj.fromJSON(value.json);
            return obj;
        }

        return value;
    }

    static ensureAction(store, action, ...args) {
        if (store && store._isMutable()) {
            // Allow mutations, but these are translated to an action under the hood
            return store.dispatch(ActionDispatcher.IMPLICIT_ACTION_PREFIX + action, ...args.map(StoreSerializer.valueToJSON));
        }
        throw new Error('Attempting to set state outside of an action');
    }
}
