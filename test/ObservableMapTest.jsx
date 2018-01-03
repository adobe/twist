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

import assert from 'assert';
import { ObservableMap, Binder, TaskQueue } from '../index';

describe('Utils.ObservableMap', () => {

    it('can create an empty ObservableMap and modify it', () => {
        let map = new ObservableMap;

        assert.equal(map.size, 0);
        assert.equal(map.has('key1'), false, 'key1 should not be in an empty map');

        let newMap = map.set('key1', 'value1');
        assert.equal(newMap, map, 'ObservableMap.set should return the map');

        assert.equal(map.size, 1);
        assert.equal(map.has('key1'), true, 'key1 should now be in the map');
        assert.equal(map.get('key1'), 'value1');
    });

    it('can create an ObservableMap out of non-map data', () => {
        let map = new ObservableMap({ 'key1': 'value1', 'key2': 'value2' });

        assert.equal(map.size, 2);
        assert.equal(map.get('key1'), 'value1');
    });

    it('can create an ObservableMap out of an array-constructed Map', () => {
        let map = new ObservableMap(new Map([ [ 'key1', 'value1' ], [ 'key2', 'value2' ] ]));

        assert.equal(map.size, 2);
        assert.equal(map.get('key1'), 'value1');
    });

    it('can delete elements from an observable map', () => {
        let map = new ObservableMap({ 'key1': 'value1', 'key2': 'value2' });
        assert.equal(map.size, 2);

        let success = map.delete('key1');
        assert.equal(success, true, 'Should be able to successfully delete an existing key');
        assert.equal(map.size, 1, 'Map should be reduced in size after deleting');
        assert.equal(map.get('key1'), undefined, 'Accessing a key that doesn\'t exist should return undefined');

        success = map.delete('key_unknown');
        assert.equal(success, false, 'delete() should return false if key is not present');
        assert.equal(map.size, 1, 'delete() of an undefined key should not affect the map size');
    });

    it('can clear an observable map', () => {
        let map = new ObservableMap({ 'key1': 'value1', 'key2': 'value2' });
        assert.equal(map.size, 2);

        let result = map.clear();
        assert.equal(result, undefined, 'clear() should return undefined');
        assert.equal(map.size, 0, 'Map should no longer have any keys after clearing');
    });

    it('swapped values affect bindings', () => {
        let map = new ObservableMap({ a: 'first item', b: 'second item' });

        let test1 = new Binder(() => map.get('a'));
        let test2 = new Binder(() => map.get('b'));
        let test3 = new Binder(() => map.size);

        assert.equal(test1.previousValue, 'first item');
        assert.equal(test2.previousValue, 'second item');
        assert.equal(test3.previousValue, 2);

        map.swapItems({ a: 'first new item' });
        TaskQueue.run();

        assert.equal(test1.previousValue, 'first new item');
        assert.equal(test2.previousValue, undefined);
        assert.equal(test3.previousValue, 1);

        test1.dispose();
        test2.dispose();
        test3.dispose();
    });

});
