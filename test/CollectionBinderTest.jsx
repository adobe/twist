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

import { CollectionBinder, TaskQueue, ObservableArray, ObservableSet, ObservableMap } from '@twist/core';
import assert from 'assert';

describe('Bindings.CollectionBinder', () => {

    it('detect ObservableArray length change', () => {
        let array = new ObservableArray;

        let signaled = 0;

        new CollectionBinder(() => array, (array) => {
            assert.ok(array instanceof Array, 'The computed array should be a regular array.');
            ++signaled;
        });

        assert.equal(signaled, 1, 'The binder callback should trigger.');

        array.push('new item');
        TaskQueue.run();

        assert.equal(signaled, 2, 'The binder callback should trigger a second time after we push a new item.');

    });

    it('detect ObservableSet length change', () => {
        let set = new ObservableSet;

        let signaled = 0;

        new CollectionBinder(() => set, (set) => {
            assert.ok(set instanceof Set, 'The computed set should be a regular set.');
            ++signaled;
        });

        assert.equal(signaled, 1, 'The binder callback should trigger.');

        set.add('new item');
        set.add('another item');
        TaskQueue.run();

        assert.equal(signaled, 2, 'The binder callback should trigger a second time after we add a new item.');

        set.delete('new item');
        TaskQueue.run();

        assert.equal(signaled, 3, 'The binder callback should trigger a third time after we delete the new item.');

        set.clear();
        TaskQueue.run();

        assert.equal(signaled, 4, 'The binder callback should trigger a fourth time after we clear the set.');
    });

    it('detect ObservableMap length change', () => {
        let map = new ObservableMap;

        let signaled = 0;

        new CollectionBinder(() => map, (map) => {
            assert.ok(map instanceof Map, 'The computed map should be a regular map.');
            ++signaled;
        });

        assert.equal(signaled, 1, 'The binder callback should trigger.');

        map.set('key', 'new item');
        map.set('otherkey', 'another item');
        TaskQueue.run();

        assert.equal(signaled, 2, 'The binder callback should trigger a second time after we set a new item.');

        map.set('otherkey', 'another item');
        TaskQueue.run();

        assert.equal(signaled, 2, 'The binder callback should NOT trigger on setting an item to its stored value.');

        map.delete('otherkey');
        TaskQueue.run();

        assert.equal(signaled, 3, 'The binder callback should trigger a third time after we delete the new item.');

        map.clear();
        TaskQueue.run();

        assert.equal(signaled, 4, 'The binder callback should trigger a fourth time after we clear the map.');
    });

});
