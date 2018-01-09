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

import Exportable from './internal/state/Exportable';
import ActionDispatcher from './internal/state/ActionDispatcher';
import StoreSerializer from './internal/state/StoreSerializer';
import thunkMiddleware from './middleware/thunkMiddleware';

import Observable from './decorators/Observable';

/**
 * Private data associated with a store.
 *
 * @private
 */
class StoreData {
    @Observable parent; // Reference to the parent store

    // The following don't need to be observable, since they're not directly exposed through any public APIs:
    name;
    middleware;
    subStores = {}; // Map from key to substore - used to keep track of the stores we need to recursively dispatch to.
}

/**
 * A Store is a container of state - users of Twist should extend Store by using the @Store decorator on a class.
 * Within a store, the @State.XXX decorators are used to define how a store should be serialized to/from JSON.
 *
 * In addition to serialization, Store provides a dispatch mechanism, so that actions can be dispatched to a store to mutate it.
 * You can attach middleware to intercept a dispatch. It also keeps track of the store hierarchy, so that when you dispatch an
 * action to a store, it gets routed to the top-level parent store (so it goes through the top-level middleware), before being
 * router back down to the target store. Actions also propagate to sub-stores (unless they return a value, which prevents propagation),
 * so that a single action can be handled by multiple stores.
 */
export default class BaseStore extends Exportable {

    __data = new StoreData;

    constructor(initialState, middleware, includeDefaultMiddleware = true) {
        super();

        // Allow middleware, for hooking into the dispatch action
        var data = this.__data;
        data.middleware = includeDefaultMiddleware ? [ thunkMiddleware ] : [];
        if (middleware instanceof Array) {
            data.middleware = data.middleware.concat(middleware);
        }
        else if (middleware) {
            // If you just have a single piece of middleware to add (e.g. devtools), you don't need to put it in an array
            data.middleware.push(middleware);
        }

        // If we have an initial state, dispatch an INIT action to set it.
        // This ensures that state is always set via an action.
        if (initialState) {
            this.dispatch(ActionDispatcher.INIT_ACTION, initialState);
        }
    }

    _isMutable() {
        if (this.__allowMutable !== undefined) {
            return this.__allowMutable;
        }
        if (this.__data.parent) {
            // Inherit from parent
            // TODO: We should cache this to avoid reading all the way up the tree every time
            return this.__data.parent._isMutable();
        }
    }

    _linkStore(name, store) {
        var subStores = this.__data.subStores;
        if (subStores[name]) {
            subStores[name].__data.parent = undefined;
            subStores[name].__data.name = undefined;
            subStores[name] = undefined;
        }
        if (store && (store instanceof BaseStore)) {
            // Make sure the store doesn't already have a parent (different from us!) - that's a no-no!
            if (store.__data.parent && store.__data.parent !== this) {
                throw new Error('The store you\'re attempting to assign to "' + name + '" already belongs to another store. The store hierarchy must be a tree.');
            }

            subStores[name] = store;
            store.__data.parent = this;
            store.__data.name = name;
        }
    }

    // Private: Internal dispatcher, so we can tell the difference between a user-invoked dispatch, and
    _doDispatch(action, payload) {

        // Dispatch the action to the current store, if it supports it
        var preventPropagation = false;
        var retVal;
        if (action === ActionDispatcher.INIT_ACTION) {
            // Special init action (initializing the store)
            super.fromJSON(...payload);
            preventPropagation = true;
        }
        else if (action.indexOf(ActionDispatcher.IMPLICIT_ACTION_PREFIX) === 0) {
            // Implicit action - the action name starts with '@@' and is a (.-separated) list of property names, ending with
            // either a property or a method name - a method name is indicated by trailing parentheses "()". Some examples:
            // a) @@prop, corresponds to setting this.prop = payload
            // b) @@prop.prop2, corresponds to setting this.prop.prop2 = payload
            // c) @@prop.method(), corresponds to calling this.prop.method(...payload)
            action = action.substring(ActionDispatcher.IMPLICIT_ACTION_PREFIX.length);
            var target = this;
            var properties = action.split('.');
            while (properties.length > 1) {
                target = target[properties.shift()];
            }
            var property = properties[0];
            if (property.substring(property.length - 2) === '()') {
                // Calling Method
                var method = property.substring(0, property.length - 2);
                retVal = target[method](...payload.map(StoreSerializer.valueFromJSON));
            }
            else {
                // Setting Property
                target[property] = StoreSerializer.valueFromJSON(...payload);
            }
            preventPropagation = true;
        }
        else {
            // It's a custom action - if we have a handler, invoke it
            var handler = this.__actionHandlers && this.__actionHandlers[action];
            if (handler) {
                if (handler.options.async) {
                    // Ignore any async actions while propagating - we print out a warning.
                    // Either the user intended to dispatch the async action, in which case they need to target the store directly (otherwise it goes through the middleware)
                    // Or, they're using the same name for both synchronous and asynchronous actions, which is a bad idea.
                    console.warn('Ignoring an asynchronous handler for action "' + action + '" while propagating. Asynchronous actions can only be dispatched directly to the target store.');
                }
                else {
                    retVal = this[handler.name](...payload);
                    preventPropagation = (retVal !== undefined) || (handler.options.propagate === false);
                }
            }
        }

        // By returning a value, an action handler can prevent the action from
        // being propagated to sub-stores
        if (preventPropagation) {
            return retVal;
        }

        // Dispatch the action to each of the sub-stores
        var subStores = this.__data.subStores;
        for (var key in subStores) {
            var store = subStores[key];
            if (store && store._doDispatch) {
                store._doDispatch(action, payload);
            }
        }
    }

    // Dispatch an action downwards to the target store. This allows you to dispatch an action on a parent store that's directed
    // at only a single child:
    // * store.dispatch('ACTION') will broadcast 'ACTION' from the root (so all child stores that listen to it will handle it)
    // * store.dispatch('substore/ACTION') is equivalent to store.substore.dispatch('ACTION')
    _dispatchDown(action, payload) {
        var route = action.split('/');
        action = route.pop();

        var store = this;
        for (var i = 0; i < route.length; i++) {
            store = store.__data.subStores[route[i]];

            if (!store) {
                // Nothing to dispatch if we can't find the store
                return;
            }
        }

        return store._doDispatch(action, payload);
    }

    // Handle an action on the current store, passing it through any installed middleware.
    _dispatchWithMiddleware(action, payload, middleware, ...args) {
        if (middleware && !ActionDispatcher.active) {
            var next = (newAction, ...newPayload) => {
                if (newAction) {
                    return this._dispatchWithMiddleware(newAction, newPayload, ...args);
                }
                return this._dispatchWithMiddleware(action, payload, ...args);
            };
            return middleware(this, action, payload, next);
        }

        if (typeof action !== 'string') {
            if (ActionDispatcher.active && typeof action === 'function') {
                throw new Error('Cannot dispatch an asynchronous action from a synchronous action');
            }
            throw new Error('Action name must be a string');
        }

        let retVal;
        try {
            ActionDispatcher.start(action);
            retVal = this._dispatchDown(action, payload);
        }
        catch (e) {
            // Even if there's an error, we still try to end the action, so other code can continue.
            ActionDispatcher.end(action, true);
            throw e;
        }
        ActionDispatcher.end(action);

        return retVal;
    }

    // Dispatch an action upwards to the parent store. This allows you to dispatch an action on a child store,
    // and have it go through the parent middleware.
    // As the action is dispatched upwards, the path back down to the target store is encoded, so the action can be routed back down to the target store.
    _dispatchUp(action, payload, origin, route) {

        // Do we need to continue propagating upwards?
        var parent = this.__data.parent;
        if (parent) {
            // TODO: We could optimize this, to jump straight to the root
            return parent._dispatchUp(action, payload, origin, this.__data.name + '/' + route);
        }

        var middleware = this.__data.middleware;

        // We're at the root, so change direction and dispatch down. There are two cases:
        // 1) Action is a string - in which case we can collapse the route+action to a single string
        if (typeof action === 'string') {
            return this._dispatchWithMiddleware(route + action, payload, ...middleware);
        }
        // 2) Action isn't a string - in which case we need to dispatch it on the origin, but with the parent's middleware
        return origin._dispatchWithMiddleware(action, payload, ...middleware);
    }

    /**
     * Dispatch the given action to the store, with any arguments passed as the action's payload.
     *
     * @param {string | Function} action The name of the action, or a function (asynchronous action).
     * @param {...*} payload The payload to pass to the action handler (you can pass multiple arguments).
     */
    dispatch(action, ...payload) {
        // Check for async actions - these just get called straight away (it's syntactic sugar)
        var handler = this.__actionHandlers && this.__actionHandlers[action];
        if (handler && handler.options.async) {
            return this[handler.name](...payload);
        }

        return this._dispatchUp(action, payload, this, '');
    }

    /**
     * Returns the parent store of the currents store. If the store is inside an array or map (e.g. `@State.byRefArray`, or
     * `@State.byRefMap`), this is the store that contains the array/map, not the array/map object itself.
     *
     * @return {Store} The parent store (or `undefined` if it's a top-level store).
     */
    getParentStore() {
        return this.__data.parent;
    }
}
