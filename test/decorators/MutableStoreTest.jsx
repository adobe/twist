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

/* global it, describe */

import assert from 'assert';
import Utils from '../Utils';

// We sneak a look at ActionDispatcher as part of the tests, but it's internal
import ActionDispatcher from '../../src/ActionDispatcher';

import { Store, State } from '../index';

/**
    Some simple stores for testing
**/

@Store
class Item {
    @State.byVal y;
}

@Store({ mutable: true })
class MutableStore {
    @State.byVal x;
    @State.byRef(Item) item;

    @State.byRefArray(Item) items;
    @State.byRefMap(Item) itemMap;
}


/**
    Tests
**/

describe('@Store({mutable: true}) decorator', () => {

    it('Can mutate @State.byVal', () => {

        var middleware = Utils.getMiddleware();
        var test = new MutableStore({}, middleware.fn);
        middleware.store = test;

        test.x = 3;
        assert.equal(test.x, 3);

        test.x = 4;
        assert.equal(test.x, 4);

        assert.deepEqual(middleware.actions, [ ActionDispatcher.INIT_ACTION, '@x', '@x' ]);
    });

    it('Can mutate @State.byRef', () => {

        var middleware = Utils.getMiddleware();
        var test = new MutableStore({}, middleware.fn);
        middleware.store = test;

        var item = new Item({ y: 'testval' });
        test.item = item;
        assert.equal(test.item.y, 'testval');

        test.item.y = 'another';
        assert.equal(test.item.y, 'another');

        assert.deepEqual(middleware.actions, [ ActionDispatcher.INIT_ACTION, '@item', 'item/@y' ]);
    });

    it('Can mutate @State.byRefArray', () => {

        var middleware = Utils.getMiddleware();
        var test = new MutableStore({}, middleware.fn);
        middleware.store = test;

        var item = new Item({ y: 'testval' });
        var pushLength = test.items.push(item);
        assert.equal(pushLength, 1);
        assert.equal(test.items.length, 1);
        assert.equal(test.items.at(0).y, 'testval');

        var poppedItem = test.items.pop();
        assert.equal(poppedItem.y, 'testval');
        assert.equal(test.items.length, 0);

        var unshiftLength = test.items.unshift(item);
        assert.equal(unshiftLength, 1);
        assert.equal(test.items.length, 1);
        assert.equal(test.items.at(0).y, 'testval');

        var shiftedItem = test.items.shift();
        assert.equal(shiftedItem.y, 'testval');
        assert.equal(test.items.length, 0);

        var splicedItems = test.items.splice(0, 0, item);
        assert.equal(splicedItems.length, 0);
        assert.equal(test.items.length, 1);
        assert.equal(test.items.at(0).y, 'testval');

        var reversedArray = test.items.reverse();
        assert.equal(reversedArray, test.items);
        assert.equal(test.items.length, 1);
        assert.equal(test.items.at(0).y, 'testval');

        test.items.length = 0;
        assert.equal(test.items.length, 0);

        test.items.length = 1;
        assert.equal(test.items.length, 1);
        assert.equal(test.items.at(0), undefined);

        test.items.setAt(0, item);
        assert.equal(test.items.length, 1);
        assert.equal(test.items.at(0).y, 'testval');

        var filledArray = test.items.fill(item, 0, 1);
        assert.equal(filledArray, test.items);
        assert.equal(test.items.length, 1);
        assert.equal(test.items.at(0).y, 'testval');

        test.items.at(0).y = 'another';
        assert.equal(test.items.length, 1);
        assert.equal(test.items.at(0).y, 'another');

        test.items.swapItems([ new Item({ y: 'changed1' }), new Item({ y: 'changed2' }) ]);
        assert.equal(test.items.length, 2);
        assert.equal(test.items.at(0).y, 'changed1');
        assert.equal(test.items.at(1).y, 'changed2');

        assert.deepEqual(middleware.actions, [
            ActionDispatcher.INIT_ACTION,
            '@items.push()',
            '@items.pop()',
            '@items.unshift()',
            '@items.shift()',
            '@items.splice()',
            '@items.reverse()',
            '@items.length',
            '@items.length',
            '@items.setAt()',
            '@items.fill()',
            'items:0/@y',
            '@items.swapItems()'
        ]);
    });

    it('Modifying an array with @State.byRefArray preserves connection to parent store', () => {

        var middleware = Utils.getMiddleware();
        var test = new MutableStore({
            items: [
                { y: 'test1' },
                { y: 'test2' }
            ]
        }, middleware.fn);
        middleware.store = test;

        var firstItem = test.items.at(0);
        var lastItem = test.items.at(1);
        lastItem.y += 'a';
        assert.equal(lastItem.y, 'test2a');

        test.items.shift();
        assert.equal(test.items.length, 1);
        assert.equal(test.items.at(0), lastItem);

        lastItem.y += 'b';
        assert.equal(lastItem.y, 'test2ab');

        test.items.push(firstItem);
        firstItem = test.items.at(1);
        firstItem.y += 'c';
        test.items.reverse();
        lastItem.y += 'd';
        assert.equal(firstItem.y, 'test1c');
        assert.equal(lastItem.y, 'test2abd');

        test.items.splice(0, 0, new Item({ y: 'test3' }));
        var newItem = test.items.at(0);
        firstItem.y += 'e';
        lastItem.y += 'f';
        newItem.y += 'g';
        assert.equal(firstItem.y, 'test1ce');
        assert.equal(lastItem.y, 'test2abdf');
        assert.equal(newItem.y, 'test3g');

        assert.deepEqual(middleware.actions, [
            ActionDispatcher.INIT_ACTION,
            'items:1/@y',
            '@items.shift()',
            'items:0/@y',
            '@items.push()',
            'items:1/@y',
            '@items.reverse()',
            'items:1/@y',
            '@items.splice()',
            'items:1/@y',
            'items:2/@y',
            'items:0/@y'
        ]);
    });

    it('Can mutate @State.byRefMap', () => {

        var middleware = Utils.getMiddleware();
        var test = new MutableStore({}, middleware.fn);
        middleware.store = test;

        var item = new Item({ y: 'testval' });
        test.itemMap.set('key', item);
        assert.equal(test.itemMap.get('key').y, 'testval');

        var wasDeleted = test.itemMap.delete('key');
        assert.equal(wasDeleted, true);
        assert.equal(test.itemMap.get('key'), undefined);

        var map = test.itemMap.set('key', item);
        assert.equal(map, test.itemMap);
        assert.equal(test.itemMap.get('key').y, 'testval');

        test.itemMap.get('key').y = 'another';
        assert.equal(test.itemMap.get('key').y, 'another');

        test.itemMap.clear();
        assert.equal(test.itemMap.get('key'), undefined);

        assert.deepEqual(middleware.actions, [
            ActionDispatcher.INIT_ACTION,
            '@itemMap.set()',
            '@itemMap.delete()',
            '@itemMap.set()',
            'itemMap:key/@y',
            '@itemMap.clear()'
        ]);
    });

    it('Setting a store results in a copy', () => {

        var test1 = new MutableStore({});
        var test2 = new MutableStore({});
        var item = new Item({ y: 'testval' });

        test1.item = item;
        test2.item = item;

        assert.notEqual(test1.item, test2.item);
        assert.notEqual(test1.item, item);
        assert.notEqual(test2.item, item);
    });

});
