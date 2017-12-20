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
import sinon from 'sinon';
import Utils from '../Utils';

// We sneak a look at ActionDispatcher as part of the tests, but it's internal
import ActionDispatcher from '../src/internal/state/ActionDispatcher';

import { Store, State, Action, Signal } from '../index';

/**
    Some simple stores for testing
**/

@Store
class EmptyTestStore {
}

@Store
class TestStore {
    @State.byVal x;

    @Action INCR() {
        this.x++;
    }
}


/**
    Tests
**/

describe('@Store decorator', () => {

    it('Basic store - can import and export', () => {

        var original = {};

        var test = new EmptyTestStore();
        var fromJSON = test.fromJSON(original);
        assert.equal(test, fromJSON);

        assert.equal(JSON.stringify(test.toJSON()), JSON.stringify(original));
    });

    it('Basic store - can initialise from JSON, and dispatch unknown action', () => {

        var original = {};
        var test = new EmptyTestStore(original);

        test.dispatch('UNKNOWN_ACTION');
        test.dispatch('UNKNOWN_ACTION/UNKNOWN_ACTION');

        assert.equal(JSON.stringify(test.toJSON()), JSON.stringify(original));
    });

    it('Basic store - action must be a string', () => {

        var original = {};
        var test = new EmptyTestStore(original);

        function testDispatch() {
            test.dispatch({ x: 2 });
        }

        Utils.assertError(testDispatch, 'Action name must be a string');
    });

    it('Store with simple state and basic action - only dispatching will update state', () => {

        var original = {
            x: 2
        };

        // Initialise from constructor
        var test = new TestStore(original);
        assert.equal(JSON.stringify(test.toJSON()), JSON.stringify(original));

        // Modifying it directly should fail
        assert.throws(() => test.x = 3, Error, 'Attempting to set state outside of an action');

        // Dispatch actions should update the state, and data binding should work
        var changed = false;
        Signal.on(test, 'x', () => changed = true);
        assert.equal(test.x, 2);

        test.dispatch('INCR');

        assert(changed, 'value change event was triggered');
        assert.equal(test.x, 3);
    });

    it('Store with action that creates another store from JSON', () => {

        @Store
        class MainStore {
            @State.byRef(TestStore) store;

            @Action SET_STORE(x) {
                this.store = new TestStore({ x });
            }
        }

        // Initialise from constructor
        var test = new MainStore({});
        assert.equal(JSON.stringify(test.toJSON()), JSON.stringify({ store: { } }));

        var callback = sinon.spy();
        test.watch(() => test.store.x, callback);

        assert.equal(test.store.x, undefined);
        test.dispatch('SET_STORE', 2);
        assert.equal(test.store.x, 2);

        assert.equal(callback.callCount, 1);
    });

    it('Store with action that takes multiple arguments', () => {

        @Store
        class MainStore {
            @State.byVal x;
            @State.byVal y;

            @Action SET(x, y) {
                this.x = x;
                this.y = y;
            }
        }

        // Initialise from constructor
        var test = new MainStore({ x: 2, y: 3 });
        assert.equal(JSON.stringify(test.toJSON()), JSON.stringify({ x: 2, y: 3 }));

        test.dispatch('SET', 10, 11);
        assert.equal(test.x, 10);
        assert.equal(test.y, 11);
    });

    it('Store with nested state - dispatched actions should propagate', () => {

        @Store
        class MainStore {
            @State.byVal x;
            @State.byRef(TestStore) store1;
            @State.byRef(TestStore) store2;

            @Action INCR() {
                this.x++;
            }
        }

        var original = {
            x: 1,
            store1: {
                x: 2
            },
            store2: {
                x: 4
            }
        };

        var test = new MainStore(original);
        assert.equal(JSON.stringify(test.toJSON()), JSON.stringify(original));

        // Substore should reference parent:
        assert.equal(test.store1.getParentStore(), test);
        assert.equal(test.store2.getParentStore(), test);

        // Changing the substore should fail
        assert.throws(() => test.store1 = undefined, Error, 'Attempting to set state outside of an action');

        // Dispatch actions should propagate to the substores
        assert.equal(test.x, 1);
        assert.equal(test.store1.x, 2);
        assert.equal(test.store2.x, 4);

        test.dispatch('INCR');
        assert.equal(test.x, 2);
        assert.equal(test.store1.x, 3);
        assert.equal(test.store2.x, 5);
    });

    it('Store with nested state - dispatched actions should not propagate if parent handler marked as propagate:false', () => {

        @Store
        class MainStore {
            @State.byVal x;
            @State.byRef(TestStore) store1;
            @State.byRef(TestStore) store2;

            @Action({ propagate: false }) INCR() {
                this.x++;
            }
        }

        var original = {
            x: 1,
            store1: {
                x: 2
            },
            store2: {
                x: 4
            }
        };

        var test = new MainStore(original);
        assert.equal(JSON.stringify(test.toJSON()), JSON.stringify(original));

        test.dispatch('INCR');
        assert.equal(test.x, 2);
        assert.equal(test.store1.x, 2);
        assert.equal(test.store2.x, 4);
    });

    it('Store with nested state - dispatched actions should not propagate if parent handler returns a value', () => {

        @Store
        class MainStore {
            @State.byVal x;
            @State.byRef(TestStore) store1;
            @State.byRef(TestStore) store2;

            @Action INCR() {
                this.x++;
                return 'incr_result';
            }
        }

        var original = {
            x: 1,
            store1: {
                x: 2
            },
            store2: {
                x: 4
            }
        };

        var test = new MainStore(original);
        assert.equal(JSON.stringify(test.toJSON()), JSON.stringify(original));

        var result = test.dispatch('INCR');
        assert.equal(result, 'incr_result');
        assert.equal(test.x, 2);
        assert.equal(test.store1.x, 2);
        assert.equal(test.store2.x, 4);
    });

    it('Store with nested state - action dispatched to sub-store should pass through parent middleware', () => {

        @Store
        class MainStore {
            @State.byRef(TestStore) store1;
            @State.byRef(TestStore) store2;
        }

        var original = {
            store1: {
                x: 2
            },
            store2: {
                x: 4
            }
        };

        var middleware = Utils.getMiddleware();
        var test = new MainStore(original, middleware.fn);
        middleware.store = test;

        test.store1.dispatch('INCR');
        assert.equal(test.store1.x, 3);
        assert.equal(test.store2.x, 4);

        assert.deepEqual(middleware.actions, [ ActionDispatcher.INIT_ACTION, 'store1/INCR' ]);
    });

    it('Store with nested state - action that dispatches another action to sub-store should only pass through parent middleware once', () => {

        @Store
        class MainStore {
            @State.byRef(TestStore) store1;
            @State.byRef(TestStore) store2;

            @Action INCR_S1() {
                this.store1.dispatch('INCR');
            }
        }

        var original = {
            store1: {
                x: 2
            },
            store2: {
                x: 4
            }
        };

        var middleware = Utils.getMiddleware();
        var test = new MainStore(original, middleware.fn);
        middleware.store = test;

        test.dispatch('INCR_S1');
        assert.equal(test.store1.x, 3);
        assert.equal(test.store2.x, 4);

        assert.deepEqual(middleware.actions, [ ActionDispatcher.INIT_ACTION, 'INCR_S1' ]);
    });

    it('Store with double-nested state - action dispatched to sub-store should pass through parent middleware', () => {

        @Store
        class IntermediateStore {
            @State.byRef(TestStore) store1;
            @State.byRef(TestStore) store2;
        }

        @Store
        class MainStore {
            @State.byRef(IntermediateStore) storeA;
            @State.byRef(IntermediateStore) storeB;
        }

        var original = {
            storeA: {
                store1: {
                    x: 2
                },
                store2: {
                    x: 4
                }
            },
            storeB: {
                store1: {
                    x: 2
                },
                store2: {
                    x: 4
                }
            }
        };

        var middleware = Utils.getMiddleware();
        var test = new MainStore(original, middleware.fn);
        middleware.store = test;

        test.storeA.store1.dispatch('INCR');
        assert.equal(test.storeA.store1.x, 3);
        assert.equal(test.storeA.store2.x, 4);
        assert.equal(test.storeB.store1.x, 2);
        assert.equal(test.storeB.store2.x, 4);

        assert.deepEqual(middleware.actions, [ ActionDispatcher.INIT_ACTION, 'storeA/store1/INCR' ]);
    });

    it('Store with nested state - action dispatched to sub-store inside an array should pass through parent middleware', () => {

        @Store
        class MainStore {
            @State.byRefArray(TestStore) stores;
        }

        var original = {
            stores: [
                {
                    x: 2
                },
                {
                    x: 4
                }
            ]
        };

        var middleware = Utils.getMiddleware();
        var test = new MainStore(original, middleware.fn);
        middleware.store = test;

        // Substore should reference parent:
        assert.equal(test.stores.at(0).getParentStore(), test);
        assert.equal(test.stores.at(1).getParentStore(), test);

        test.stores.at(0).dispatch('INCR');
        assert.equal(test.stores.at(0).x, 3);
        assert.equal(test.stores.at(1).x, 4);

        assert.deepEqual(middleware.actions, [ ActionDispatcher.INIT_ACTION, 'stores:0/INCR' ]);
    });

    it('Store with nested state - action dispatched to sub-store inside an map should pass through parent middleware', () => {

        @Store
        class MainStore {
            @State.byRefMap(TestStore) stores;
        }

        var original = {
            stores: {
                store1: {
                    x: 2
                },
                store2: {
                    x: 4
                }
            }
        };

        var middleware = Utils.getMiddleware();
        var test = new MainStore(original, middleware.fn);
        middleware.store = test;

        // Substore should reference parent:
        assert.equal(test.stores.get('store1').getParentStore(), test);
        assert.equal(test.stores.get('store2').getParentStore(), test);

        test.stores.get('store1').dispatch('INCR');
        assert.equal(test.stores.get('store1').x, 3);
        assert.equal(test.stores.get('store2').x, 4);

        assert.deepEqual(middleware.actions, [ ActionDispatcher.INIT_ACTION, 'stores:store1/INCR' ]);
    });

    it('Store with nested state - can replace sub-store - only new one should get updates', () => {

        var removedStore;

        @Store
        class MainStore {
            @State.byRef(TestStore) store1;
            @State.byRef(TestStore) store2;

            @Action SWAP() {
                removedStore = this.store2;
                var newStore = new TestStore;
                newStore.x = 10;
                this.store2 = newStore;
            }
        }

        var original = {
            store1: {
                x: 2
            },
            store2: {
                x: 4
            }
        };

        var middleware = Utils.getMiddleware();
        var test = new MainStore(original, middleware.fn);
        middleware.store = test;

        // Substore should reference parent:
        assert.equal(test.store1.getParentStore(), test);
        assert.equal(test.store2.getParentStore(), test);

        test.dispatch('SWAP');
        assert.equal(removedStore.x, 4);
        assert.equal(test.store1.x, 2);
        assert.equal(test.store2.x, 10);

        // Removed store should no longer reference parent:
        assert.equal(removedStore.getParentStore(), undefined);
        assert.equal(test.store1.getParentStore(), test);
        assert.equal(test.store2.getParentStore(), test);

        test.dispatch('INCR');
        assert.equal(removedStore.x, 4);
        assert.equal(test.store1.x, 3);
        assert.equal(test.store2.x, 11);

        removedStore.dispatch('INCR');
        assert.equal(removedStore.x, 5);
        assert.equal(test.store1.x, 3);
        assert.equal(test.store2.x, 11);

        assert.deepEqual(middleware.actions, [ ActionDispatcher.INIT_ACTION, 'SWAP', 'INCR' ]);
    });

    it('Store with nested state - can remove sub-store from an array and add a new one - only new one should get updates', () => {

        var removedStore;

        @Store
        class MainStore {
            @State.byRefArray(TestStore) stores;

            @Action SWAP() {
                removedStore = this.stores.pop();
                var newStore = new TestStore;
                newStore.x = 10;
                this.stores.push(newStore);
            }
        }

        var original = {
            stores: [
                {
                    x: 2
                },
                {
                    x: 4
                }
            ]
        };

        var middleware = Utils.getMiddleware();
        var test = new MainStore(original, middleware.fn);
        middleware.store = test;

        test.dispatch('SWAP');
        assert.equal(removedStore.x, 4);
        assert.equal(test.stores.at(0).x, 2);
        assert.equal(test.stores.at(1).x, 10);

        test.dispatch('INCR');
        assert.equal(removedStore.x, 4);
        assert.equal(test.stores.at(0).x, 3);
        assert.equal(test.stores.at(1).x, 11);

        removedStore.dispatch('INCR');
        assert.equal(removedStore.x, 5);
        assert.equal(test.stores.at(0).x, 3);
        assert.equal(test.stores.at(1).x, 11);

        assert.deepEqual(middleware.actions, [ ActionDispatcher.INIT_ACTION, 'SWAP', 'INCR' ]);
    });

    it('Store with nested state - can remove sub-store from an array by changing length, and add a new one - only new one should get updates', () => {

        var removedStore;

        @Store
        class MainStore {
            @State.byRefArray(TestStore) stores;

            @Action SWAP() {
                removedStore = this.stores.at(this.stores.length - 1);
                this.stores.length--; // Should remove the last element by shrinking the length
                var newStore = new TestStore;
                newStore.x = 10;
                this.stores.push(newStore);
            }
        }

        var original = {
            stores: [
                {
                    x: 2
                },
                {
                    x: 4
                }
            ]
        };

        var middleware = Utils.getMiddleware();
        var test = new MainStore(original, middleware.fn);
        middleware.store = test;

        test.dispatch('SWAP');
        assert.equal(removedStore.x, 4);
        assert.equal(test.stores.at(0).x, 2);
        assert.equal(test.stores.at(1).x, 10);

        test.dispatch('INCR');
        assert.equal(removedStore.x, 4);
        assert.equal(test.stores.at(0).x, 3);
        assert.equal(test.stores.at(1).x, 11);

        removedStore.dispatch('INCR');
        assert.equal(removedStore.x, 5);
        assert.equal(test.stores.at(0).x, 3);
        assert.equal(test.stores.at(1).x, 11);

        assert.deepEqual(middleware.actions, [ ActionDispatcher.INIT_ACTION, 'SWAP', 'INCR' ]);
    });

    it('Store with nested state - can replace sub-store in an array - only new one should get updates', () => {

        var removedStore;

        @Store
        class MainStore {
            @State.byRefArray(TestStore) stores;

            @Action SWAP() {
                removedStore = this.stores.at(1);
                var newStore = new TestStore;
                newStore.x = 10;
                this.stores.setAt(1, newStore);
            }
        }

        var original = {
            stores: [
                {
                    x: 2
                },
                {
                    x: 4
                }
            ]
        };

        var middleware = Utils.getMiddleware();
        var test = new MainStore(original, middleware.fn);
        middleware.store = test;

        test.dispatch('SWAP');
        assert.equal(removedStore.x, 4);
        assert.equal(test.stores.at(0).x, 2);
        assert.equal(test.stores.at(1).x, 10);

        test.dispatch('INCR');
        assert.equal(removedStore.x, 4);
        assert.equal(test.stores.at(0).x, 3);
        assert.equal(test.stores.at(1).x, 11);

        removedStore.dispatch('INCR');
        assert.equal(removedStore.x, 5);
        assert.equal(test.stores.at(0).x, 3);
        assert.equal(test.stores.at(1).x, 11);

        assert.deepEqual(middleware.actions, [ ActionDispatcher.INIT_ACTION, 'SWAP', 'INCR' ]);
    });

    it('Store with nested state - can remove sub-store from a map and add a new one - only new one should get updates', () => {

        var removedStore;

        @Store
        class MainStore {
            @State.byRefMap(TestStore) stores;

            @Action SWAP() {
                removedStore = this.stores.get('store2');
                var newStore = new TestStore;
                newStore.x = 10;
                this.stores.set('store2', newStore);
            }
        }

        var original = {
            stores: {
                store1: {
                    x: 2
                },
                store2: {
                    x: 4
                }
            }
        };

        var middleware = Utils.getMiddleware();
        var test = new MainStore(original, middleware.fn);
        middleware.store = test;

        test.dispatch('SWAP');
        assert.equal(removedStore.x, 4);
        assert.equal(test.stores.get('store1').x, 2);
        assert.equal(test.stores.get('store2').x, 10);

        test.dispatch('INCR');
        assert.equal(removedStore.x, 4);
        assert.equal(test.stores.get('store1').x, 3);
        assert.equal(test.stores.get('store2').x, 11);

        removedStore.dispatch('INCR');
        assert.equal(removedStore.x, 5);
        assert.equal(test.stores.get('store1').x, 3);
        assert.equal(test.stores.get('store2').x, 11);

        assert.deepEqual(middleware.actions, [ ActionDispatcher.INIT_ACTION, 'SWAP', 'INCR' ]);
    });

    it('Store with double-nested state - action dispatched to sub-store should pass through parent middleware', () => {

        @Store
        class IntermediateStore {
            @State.byRef(TestStore) store2;
            @State.byRef(TestStore) store3;
        }

        @Store
        class MainStore {
            @State.byRef(TestStore) store1;
            @State.byRef(IntermediateStore) intermediate;
        }

        var original = {
            store1: {
                x: 2
            },
            intermediate: {
                store2: {
                    x: 4
                },
                store3: {
                    x: 6
                }
            }
        };

        var middleware = Utils.getMiddleware();
        var test = new MainStore(original, middleware.fn);
        middleware.store = test;

        test.dispatch('INCR');
        assert.equal(test.store1.x, 3);
        assert.equal(test.intermediate.store2.x, 5);
        assert.equal(test.intermediate.store3.x, 7);

        test.intermediate.dispatch('INCR');
        assert.equal(test.store1.x, 3);
        assert.equal(test.intermediate.store2.x, 6);
        assert.equal(test.intermediate.store3.x, 8);

        assert.deepEqual(middleware.actions, [ ActionDispatcher.INIT_ACTION, 'INCR', 'intermediate/INCR' ]);
    });

    it('Store with array - test unshift, shift, splice, fill, reverse, sort', () => {

        @Store
        class MainStore {
            @State.byRefArray(TestStore) stores;

            @Action UNSHIFT() {
                var oldLength = this.stores.length;
                this.stores.unshift(new TestStore, new TestStore);
                assert.equal(this.stores.length, oldLength + 2);
            }

            @Action SHIFT() {
                var oldLength = this.stores.length;
                var oldItem = this.stores.at(0);
                var item = this.stores.shift();
                assert.equal(this.stores.length, oldLength - 1);
                assert.equal(item, oldItem);
            }

            @Action SPLICE() {
                var oldLength = this.stores.length;
                var oldItem = this.stores.at(oldLength - 1);
                var items = this.stores.splice(oldLength - 1, 1, new TestStore, new TestStore);
                assert.equal(this.stores.length, oldLength + 1);
                assert.equal(items.at(0), oldItem);
            }

            @Action FILL() {
                var oldLength = this.stores.length;
                this.stores.fill(new TestStore);
                assert.equal(this.stores.length, oldLength);
            }

            @Action REVERSE() {
                var oldLength = this.stores.length;
                this.stores.reverse();
                assert.equal(this.stores.length, oldLength);
            }

            @Action SORT() {
                var oldLength = this.stores.length;
                this.stores.sort(() => -1);
                assert.equal(this.stores.length, oldLength);
            }

            @Action SWAP_ITEMS() {
                this.stores.swapItems([ new TestStore ]);
                assert.equal(this.stores.length, 1);
            }
        }

        var original = {
            stores: []
        };

        var test = new MainStore(original);
        test.dispatch('UNSHIFT');
        test.dispatch('SHIFT');
        test.dispatch('SPLICE');
        test.dispatch('FILL');
        test.dispatch('REVERSE');
        test.dispatch('SORT');
        test.dispatch('SWAP_ITEMS');
    });

    it('Store with map - test delete, clear', () => {

        @Store
        class MainStore {
            @State.byRefMap(TestStore) stores;

            @Action DELETE() {
                this.stores.delete('store1');
                assert.deepEqual(Array.from(this.stores.keys()), [ 'store2', 'store3' ]);
            }

            @Action CLEAR() {
                this.stores.clear();
                assert.deepEqual(Array.from(this.stores.keys()), [ ]);
            }
        }

        var original = {
            stores: {
                store1: {
                    x: 2
                },
                store2: {
                    x: 2
                },
                store3: {
                    x: 2
                }
            }
        };

        var test = new MainStore(original);
        test.dispatch('DELETE');
        test.dispatch('CLEAR');
    });

    it('Can\'t store the same store in more than one store', () => {

        @Store
        class MainStore {
            @State.byRef(TestStore) store;

            @Action SET_STORE(store) {
                this.store = store;
            }
        }

        var test1 = new MainStore({});
        var test2 = new MainStore({});
        var item = new TestStore({});

        test1.dispatch('SET_STORE', item);

        Utils.assertError(() => test2.dispatch('SET_STORE', item), 'The store you\'re attempting to assign to "store" already belongs to another store. The store hierarchy must be a tree.');
    });

});
