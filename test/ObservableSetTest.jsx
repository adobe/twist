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
import { ObservableSet, Binder, TaskQueue } from '@twist/core';

describe('Utils.ObservableSet', () => {

    it('can create an empty ObservableSet and modify it', () => {
        let set = new ObservableSet;

        assert.equal(set.size, 0);

        set.add('value');
        set.add('value');

        assert.equal(set.size, 1);
        assert.equal(set.has('value'), true);
    });

    it('can create an ObservableSet out of an iterable object', () => {
        let map = new Map([ [ 'key1', 'value1' ], [ 'key2', 'value2' ] ]);
        let set = new ObservableSet(map.values());

        assert.equal(set.size, 2);
        assert.equal(set.has('value1'), true);
    });

    it('can create an ObservableSet out of an array-constructed Set', () => {
        let set = new ObservableSet(new Set([ 'value1', 'value2' ]));

        assert.equal(set.size, 2);
        assert.equal(set.has('value1'), true);
    });

    it('swapped values affect bindings', () => {
        let set = new ObservableSet([ 'first item', 'second item' ]);

        let test1 = new Binder(() => set.has('first item'));
        let test2 = new Binder(() => set.has('second item'));
        let test3 = new Binder(() => set.size);

        assert.equal(test1.previousValue, true);
        assert.equal(test2.previousValue, true);
        assert.equal(test3.previousValue, 2);

        set.swapItems([ 'second item' ]);
        TaskQueue.run();

        assert.equal(test1.previousValue, false);
        assert.equal(test2.previousValue, true);
        assert.equal(test3.previousValue, 1);

        test1.dispose();
        test2.dispose();
        test3.dispose();
    });

});
