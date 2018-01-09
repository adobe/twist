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
import ActionDispatcher from '../../src/internal/state/ActionDispatcher';

import { ObservableArray } from '../../index';

describe('@State.XXX decorators', () => {

    it('@State.byVal - import and export', () => {

        @Store
        class TestClass {
            @State.byVal x;
            @State.byVal y;
            @State.byVal z;
        }

        var original = {
            x: 'value1',
            y: 42,
            z: { x: 42 }
        };

        var test = new TestClass();
        test.dispatch(ActionDispatcher.INIT_ACTION, original);

        assert.notEqual(test.z, original.z); // byVal should clone the object
        assert.equal(JSON.stringify(test.toJSON()), JSON.stringify(original));
    });

    it('@State.byVal - import and export should stick to defined values', () => {

        @Store
        class TestClass {
            @State.byVal x;
        }

        var original = {
            x: 'value1',
            y: 'value2'
        };

        var test = new TestClass(original);
        assert.equal(JSON.stringify(test.toJSON()), JSON.stringify({ x: 'value1' }));
    });

    it('@State.byVal - should work with common names', () => {

        @Store
        class TestClass {
            @State.byVal name;
            @State.byVal parent;
            @State.byVal owner;
        }

        var original = {
            name: 'testName',
            parent: 'testParent',
            owner: 'testOwner'
        };

        @Store
        class ParentClass {
            @State.byRef(TestClass) owner;
        }

        var test = new ParentClass({ owner: original });

        assert.equal(test.owner.name, 'testName');
        assert.equal(test.owner.parent, 'testParent');
        assert.equal(test.owner.owner, 'testOwner');
    });

    it('@State.byBooleanVal', () => {

        @Store
        class TestClass {
            @State.byBooleanVal x;
            @State.byBooleanVal y;
            @State.byBooleanVal z;
            @State.byBooleanVal t;
        }

        var original = {
            x: 'true',
            y: 'false',
            z: false,
            t: 0
        };

        var test = new TestClass(original);
        assert.equal(JSON.stringify(test.toJSON()), JSON.stringify({ x: true, y: false, z: false, t: false }));
    });

    it('@State.byNumberVal', () => {

        @Store
        class TestClass {
            @State.byNumberVal x;
            @State.byNumberVal y;
            @State.byNumberVal z;
        }

        var original = {
            x: 42,
            y: '42',
            z: 'xxx'
        };

        var test = new TestClass(original);
        assert.equal(JSON.stringify(test.toJSON()), JSON.stringify({ x: 42, y: 42, z: null }));
    });

    it('@State.bySimpleVal', () => {

        @Store
        class TestClass {
            @State.bySimpleVal x;
            @State.bySimpleVal y;
            @State.bySimpleVal z;
        }

        var original = {
            x: 'thisisastring',
            y: { x: 2 },
            z: 42
        };

        var test = new TestClass(original);
        assert.equal(test.y, original.y); // bySimpleVal doesn't clone any objects
        assert.equal(JSON.stringify(test.toJSON()), JSON.stringify(original));
    });

    it('@State.byArray(true)', () => {

        @Store
        class TestClass {
            @State.byArray(true) x;
            @State.byArray(true) y;
            @State.byArray(true) z;
        }

        var original = {
            x: [ 1, 2, 3 ],
            y: [ ],
            z: 42
        };

        var test = new TestClass(original);
        assert.notEqual(test.x, original.x); // byArrayVal slices the array
        assert.equal(JSON.stringify(test.toJSON()), JSON.stringify({ x: [ 1, 2, 3 ], y: [ ], z: [ ] }));
    });

    it('@State.byCustomVal', () => {

        const ArrayOfString = {
            parse(jsonValue) {
                return new ObservableArray(jsonValue ? jsonValue : [ ]);
            },
            serialize(value) {
                return value.toArray();
            }
        };

        @Store
        class TestClass {
            @State.byCustomVal(ArrayOfString) x;
            @State.byCustomVal(ArrayOfString) y;
            @State.byCustomVal(ArrayOfString, [ 42 ]) z;
        }

        var original = {
            x: [ 1, 2, 3 ],
            y: [ ]
        };

        var test = new TestClass(original);
        assert.notEqual(test.x, original.x);
        assert.equal(JSON.stringify(test.toJSON()), JSON.stringify({ x: [ 1, 2, 3 ], y: [ ], z: [ 42 ] }));
    });

    it('@State.byRef', () => {

        @Store
        class TestRefClass {
            @State.byVal x;
            @State.byVal y;
        }

        @Store
        class TestClass {
            @State.byRef(TestRefClass) x;
            @State.byRef(TestRefClass) y;
        }

        var original = {
            x: { x: 2, y: 3 }
        };

        var test = new TestClass();
        assert.equal(JSON.stringify(test.toJSON()), JSON.stringify({ x: null, y: null }));

        test.dispatch(ActionDispatcher.INIT_ACTION, original);
        assert(test.x instanceof TestRefClass);
        assert.equal(JSON.stringify(test.toJSON()), JSON.stringify({ x: { x: 2, y: 3 }, y: { } }));
    });

    it('@State.byOptionalRef', () => {

        @Store
        class TestRefClass {
            @State.byVal x;
            @State.byVal y;
        }

        @Store
        class TestClass {
            @State.byOptionalRef(TestRefClass) x;
            @State.byOptionalRef(TestRefClass) y;
        }

        var original = {
            x: { x: 2, y: 3 }
        };

        var test = new TestClass();
        assert.equal(JSON.stringify(test.toJSON()), JSON.stringify({ x: null, y: null }));

        test.dispatch(ActionDispatcher.INIT_ACTION, original);
        assert(test.x instanceof TestRefClass);
        assert.equal(JSON.stringify(test.toJSON()), JSON.stringify({ x: { x: 2, y: 3 }, y: null }));
    });

    it('@State.byCustomRef', () => {

        @Store
        class TestRefClass {
            @State.byVal x;
            @State.byVal y;
        }

        var typeFn = function(jsonValue) {
            if (!jsonValue || !jsonValue.ignore) {
                return new TestRefClass();
            }
        };

        @Store
        class TestClass {
            @State.byCustomRef(typeFn) x;
            @State.byCustomRef(typeFn) y;
            @State.byCustomRef(typeFn) z;
        }

        var original = {
            x: { x: 2, y: 3 },
            y: { x: 2, y: 3, ignore: true },
        };

        var test = new TestClass();
        assert.equal(JSON.stringify(test.toJSON()), JSON.stringify({ x: null, y: null, z: null }));

        test.dispatch(ActionDispatcher.INIT_ACTION, original);
        assert(test.x instanceof TestRefClass);
        assert.equal(JSON.stringify(test.toJSON()), JSON.stringify({ x: { x: 2, y: 3 }, y: null, z: {} }));
    });

    it('@State.byRefArray', () => {

        @Store
        class TestRefClass {
            @State.byVal x;
            @State.byVal y;
        }

        @Store
        class TestClass {
            @State.byRefArray(TestRefClass) x;
            @State.byRefArray(TestRefClass) y;
            @State.byRefArray(TestRefClass) z;

            @Action UPDATE() {
                this.z.push(undefined);
            }
        }

        var original = {
            x: [ { x: 2, y: 3 } ],
            y: [ { }, undefined, { } ],
        };

        var test = new TestClass();
        assert.equal(JSON.stringify(test.toJSON()), JSON.stringify({ x: [ ], y: [ ], z: [ ] }));

        test.dispatch(ActionDispatcher.INIT_ACTION, original);

        // Make sure can't update outside an action
        Utils.assertError(() => test.z.push(undefined), 'Attempting to set state outside of an action');
        test.dispatch('UPDATE');

        assert(test.x instanceof ObservableArray);
        assert(test.x.at(0) instanceof TestRefClass);
        assert.equal(JSON.stringify(test.toJSON()), JSON.stringify({ x: [ { x: 2, y: 3 } ], y: [ { }, { }, { } ], z: [ null ] }));
    });

    // TODO: Don't use components here
    // it('@State.byRefArray - should work with <repeat>', () => {
    //
    //     @Store
    //     class TestRefClass {
    //         @State.byVal desc;
    //         @State.byVal y;
    //     }
    //
    //     @Store
    //     class TestClass {
    //         @State.byRefArray(TestRefClass) arr;
    //
    //         @Action UPDATE() {
    //             var item = new TestRefClass;
    //             item.desc = 'Description 2';
    //             this.arr.push(item);
    //         }
    //     }
    //
    //     var original = {
    //         arr: [ { desc: 'Description 1' } ],
    //     };
    //
    //     var test = new TestClass(original);
    //
    //     /* global item */
    //     var testRepeat = Test.jsx(() => <repeat for={ item in test.arr }>{ item.desc }</repeat>);
    //
    //     assert.equal(testRepeat.node.childNodes.length, 1);
    //     assert.equal(testRepeat.node.firstChild.textContent, 'Description 1');
    //
    //     test.dispatch('UPDATE');
    //     TaskQueue.run();
    //
    //     assert.equal(testRepeat.node.childNodes.length, 2);
    //     assert.equal(testRepeat.node.firstChild.textContent, 'Description 1');
    //     assert.equal(testRepeat.node.lastChild.textContent, 'Description 2');
    //
    //     testRepeat.dispose();
    // });

    it('@State.byCustomRefArray', () => {

        @Store
        class TestRefClass {
            @State.byVal x;
            @State.byVal y;
        }

        var typeFn = function(jsonValue) {
            if (!jsonValue || !jsonValue.ignore) {
                return new TestRefClass();
            }
        };

        @Store
        class TestClass {
            @State.byCustomRefArray(typeFn) x;
            @State.byCustomRefArray(typeFn) y;
            @State.byCustomRefArray(typeFn) z;

            @Action UPDATE() {
                this.z.push(undefined);
            }
        }

        var original = {
            x: [ { x: 2, y: 3 }, { x: 2, y: 3, ignore: true } ],
            y: [ { }, undefined, { } ],
        };

        var test = new TestClass();
        assert.equal(JSON.stringify(test.toJSON()), JSON.stringify({ x: [ ], y: [ ], z: [ ] }));

        test.dispatch(ActionDispatcher.INIT_ACTION, original);

        // Make sure can't update outside an action
        Utils.assertError(() => test.z.push(undefined), 'Attempting to set state outside of an action');
        test.dispatch('UPDATE');

        assert(test.x instanceof ObservableArray);
        assert(test.x.at(0) instanceof TestRefClass);
        assert.equal(JSON.stringify(test.toJSON()), JSON.stringify({ x: [ { x: 2, y: 3 } ], y: [ { }, { }, { } ], z: [ null ] }));
    });

    it('@State.byRefMap', () => {

        @Store
        class TestRefClass {
            @State.byVal x;
            @State.byVal y;
        }

        @Store
        class TestClass {
            @State.byRefMap(TestRefClass) x;
            @State.byRefMap(TestRefClass) y;
            @State.byRefMap(TestRefClass) z;

            @Action UPDATE() {
                this.x.set('testC', undefined);
            }
        }

        var original = {
            x: {
                testA: { x: 2, y: 3 },
                testB: { },
                testC: undefined
            },
            y: { },
        };

        var test = new TestClass();
        assert.equal(JSON.stringify(test.toJSON()), JSON.stringify({ x: { }, y: { }, z: { } }));

        test.dispatch(ActionDispatcher.INIT_ACTION, original);

        // Make sure can't update outside an action
        Utils.assertError(() => test.x.set('testC', undefined), 'Attempting to set state outside of an action');
        test.dispatch('UPDATE');

        assert(test.x.get('testA') instanceof TestRefClass);
        assert.equal(JSON.stringify(test.toJSON()), JSON.stringify({ x: { testA: { x: 2, y: 3 }, testB: { }, testC: null }, y: { }, z: { } }));
    });

    it('@State.alias', () => {

        @Store
        class TestClass {
            @State.alias('myX') @State.byVal x;
            @State.alias('myY') @State.byVal y;
            @State.alias('myZ') @State.byVal z;
        }

        var original = {
            myX: 'value1',
            myY: 42,
            myZ: { x: 42 }
        };

        var test = new TestClass(original);
        assert.equal(JSON.stringify(test.toJSON()), JSON.stringify(original));
    });

});
