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
import { ObservableArray, Binder, TaskQueue } from '@twist/core';

describe('Utils.ObservableArray', () => {

    it('updates to ObservableArray by mutators should invalidate jsx', () => {
        let arr = new ObservableArray([ 'first item' ]);

        let test = new Binder(() => arr.at(0));

        assert.equal(test.previousValue, 'first item');

        arr.unshift('second item');
        TaskQueue.run();

        assert.equal(test.previousValue, 'second item');

        test.dispose();
    });

    it('setAt() changes value and signals the change', () => {
        let arr = new ObservableArray([ 'first item', 'second item' ]);

        let test = new Binder(() => arr.at(1));

        assert.equal(test.previousValue, 'second item');

        arr.setAt(1, 'changed item');
        TaskQueue.run();

        assert.equal(test.previousValue, 'changed item');

        test.dispose();
    });

    it('round trips active arrays to native arrays and back', () => {
        let arr = new ObservableArray([ 'first item', 'second item' ]);
        let arr2 = new ObservableArray(arr.toArray());

        let test = new Binder(() => arr2.at(0));

        assert.equal(test.previousValue, 'first item');

        test.dispose();
    });

    it('resizing array to same size has no effect', () => {
        let arr = new ObservableArray([ 'first item', 'second item' ]);

        let test = new Binder(() => arr.at(1));

        assert.equal(test.previousValue, 'second item');

        arr.length = 2;
        TaskQueue.run();

        assert.equal(test.previousValue, 'second item');

        test.dispose();
    });

    it('resizing array to larger size does not affect previous bindings', () => {
        let arr = new ObservableArray([ 'first item' ]);

        let test1 = new Binder(() => arr.at(0));
        let test2 = new Binder(() => arr.at(1));

        assert.equal(test1.previousValue, 'first item');
        assert.equal(test2.previousValue, undefined);

        arr.length = 2;
        TaskQueue.run();

        assert.equal(test1.previousValue, 'first item');
        assert.equal(test2.previousValue, undefined);

        test1.dispose();
        test2.dispose();
    });

    it('resizing array to smaller size changes bindings to truncated values', () => {
        let arr = new ObservableArray([ 'first item', 'second item' ]);

        let test1 = new Binder(() => arr.at(0));
        let test2 = new Binder(() => arr.at(1));

        assert.equal(test1.previousValue, 'first item');
        assert.equal(test2.previousValue, 'second item');

        arr.length = 1;
        TaskQueue.run();

        assert.equal(test1.previousValue, 'first item');
        assert.equal(test2.previousValue, undefined);

        test1.dispose();
        test2.dispose();
    });

    it('swapped values affect bindings', () => {
        let arr = new ObservableArray([ 'first item', 'second item' ]);

        let test1 = new Binder(() => arr.at(0));
        let test2 = new Binder(() => arr.at(1));

        assert.equal(test1.previousValue, 'first item');
        assert.equal(test2.previousValue, 'second item');

        arr.swapItems([ 'swapped value' ]);
        TaskQueue.run();

        assert.equal(test1.previousValue, 'swapped value');
        assert.equal(test2.previousValue, undefined);

        test1.dispose();
        test2.dispose();
    });

    it('removeItem deletes one item and updates bindings', () => {
        let arr = new ObservableArray([ 'one', 'two', 'three', 'two' ]);

        let test1 = new Binder(() => arr.at(0));
        let test2 = new Binder(() => arr.at(1));

        assert.equal(test1.previousValue, 'one');
        assert.equal(test2.previousValue, 'two');

        arr.removeItem('two');
        assert.equal(arr.length, 3);

        TaskQueue.run();

        assert.equal(test1.previousValue, 'one');
        assert.equal(test2.previousValue, 'three');

        test1.dispose();
        test2.dispose();
    });

    it('overrides Array.prototype.concat properly', () => {
        let a = new ObservableArray([ 1, 2, 3 ]);
        let b = new ObservableArray([ 4, 5, 6 ]);
        let c = new ObservableArray([ 7, 8 ]);
        let d = [ 9 ];
        assert.deepEqual(a.concat(b, c, d).toArray(), [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ]);
        assert.deepEqual(a.concatToArray(b, c, d), [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ]);

        let test = new Binder(() => a.concat(b, c).join(''));
        assert.equal(test.previousValue, '12345678');
        TaskQueue.run();

        a.unshift('.');
        b.unshift('.');
        c.unshift('.');
        TaskQueue.run();
        assert.equal(test.previousValue, '.123.456.78');

        test.dispose();
    });

    it('overrides Array methods which return a new instance of array properly', () => {
        let a = new ObservableArray([ 'a', 'b', 'c' ]);

        // Map
        assert.deepEqual(a.map(v => v + '!').toArray(), [ 'a!', 'b!', 'c!' ]);
        assert.deepEqual(a.mapToArray(v => v + '!'), [ 'a!', 'b!', 'c!' ]);
        // Slice
        assert.deepEqual(a.slice().toArray(), [ 'a', 'b', 'c' ]);
        assert.deepEqual(a.slice(1,2).toArray(), [ 'b' ]);
        assert.deepEqual(a.sliceToArray(), [ 'a', 'b', 'c' ]);
        assert.deepEqual(a.sliceToArray(1,2), [ 'b' ]);
        // Filter
        assert.deepEqual(a.filter(v => v !== 'a').toArray(), [ 'b', 'c' ]);
        assert.deepEqual(a.filterToArray(v => v !== 'a'), [ 'b', 'c' ]);

        let test = new Binder(() =>
            a.filter(v => v !== 'a')
                .map(v => v + '!')
                .slice(0,2).join('')
        );

        assert.equal(test.previousValue, 'b!c!');
        TaskQueue.run();

        a.unshift('o');
        TaskQueue.run();
        assert.equal(test.previousValue, 'o!b!');

        test.dispose();
    });

    it('overrides Array mutators returning array properly', () => {
        let a = new ObservableArray([ 3, 2, 1 ]);
        let b = a.sort();
        assert.deepEqual(a.toArray(), [ 1, 2, 3 ]);
        assert.equal(a, b);

        let c = a.fill('a');
        assert.deepEqual(c.toArray(), [ 'a', 'a', 'a' ]);
        assert.equal(a, c);

        a.push('c'); // a a a c
        let test = new Binder(() =>  a.copyWithin(0, 3).join(''));
        assert.equal(test.previousValue, 'caac');

        a.fill('o');
        TaskQueue.run();
        assert.equal(test.previousValue, 'oooo');

        test.dispose();
    });

    it('toArray() triggers bindings', () => {
        let arr = new ObservableArray([ 'a', 'b' ]);
        let test = new Binder(() => arr.toArray().join(''));
        assert.equal(test.previousValue, 'ab');

        arr.push('c');
        TaskQueue.run();
        assert.equal(test.previousValue, 'abc');

        test.dispose();
    });

});
