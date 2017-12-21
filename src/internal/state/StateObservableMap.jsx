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

import ObservableMap from '../../ObservableMap';
import ActionDispatcher from './ActionDispatcher';
import StoreSerializer from './StoreSerializer';

/**
 * State wrapper for ObservableMap
 */
export default class StateObservableMap extends ObservableMap {

    _linkItem(key, item) {
        this._parent._linkStore(this._name + ':' + key, item);
    }

    _linkItems(keys) {
        var iterKeys = keys || this.keys();
        for (var key of iterKeys) {
            this._linkItem(key, this.get(key));
        }
    }

    set(key, item) {
        if (!ActionDispatcher.active) {
            return StoreSerializer.ensureAction(this._parent, this._name + '.set()', key, item);
        }

        super.set(key, item);
        this._linkItem(key, item);
        return this;
    }

    delete(key) {
        if (!ActionDispatcher.active) {
            return StoreSerializer.ensureAction(this._parent, this._name + '.delete()', key);
        }

        var wasDeleted = super.delete(key);
        this._linkItem(key);
        return wasDeleted;
    }

    clear() {
        if (!ActionDispatcher.active) {
            return StoreSerializer.ensureAction(this._parent, this._name + '.clear()');
        }

        var keys = this.keys();
        super.clear();
        this._linkItems(keys);
    }

}
