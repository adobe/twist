# BaseStore

A Store is a container of state - users of Twist should extend Store by using the [`@Store`](../decorators/Store.md) decorator on a class. Within a store, the [`@State`](../decorators/State.md).XXX decorators are used to define how a store should be serialized to/from JSON.

In addition to serialization, Store provides a dispatch mechanism, so that actions can be dispatched to a store to mutate it. You can attach middleware to intercept a dispatch. It also keeps track of the store hierarchy, so that when you dispatch an action to a store, it gets routed to the top-level parent store (so it goes through the top-level middleware), before being router back down to the target store. Actions also propagate to sub-stores (unless they return a value, which prevents propagation), so that a single action can be handled by multiple stores.

For more information regarding stores:

* [State Containers](../../fundamentals/state-containers.md)
* [`@Store`](../decorators/Store.md)
* [`@State`](../decorators/State.md)
* [`@Action`](../decorators/Action.md)
* [Middleware](../middleware/index.md)

## Public Methods

### public dispatch(action: string | Function, payload: ...*): * 

Dispatch the given action to the store, with any arguments passed as the action's payload.

Params:
Name   |Type   |Attribute  |Description
-------|-------|-----------|-----------
action |string \| Function || The name of the action, or a function (asynchronous action).
payload|...*|| The payload to pass to the action handler (you can pass multiple arguments).

Return: *

### public getParentStore(): Store 

Returns the parent store of the currents store. If the store is inside an array or map (e.g. @State.byRefArray, or @State.byRefMap), this is the store that contains the array/map, not the array/map object itself.

Return: Store, The parent store (or undefined if it's a top-level store).