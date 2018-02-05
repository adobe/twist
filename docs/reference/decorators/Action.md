# @Action

The `@Action` decorator indicates that a method on a [`Store`](./Store.md) is capable of mutating the store's state. By default, any attempt to mutate the store's state will throw an error, unless that store has been explicitly marked as allowing mutations.

A typical action looks like this:

```jsx
@Action
SET_NAME(name) {
    this.name = name;
}
```

Actions are dispatched using the [`dispatch`](../core/BaseStore.md#dispatch) method. Because `dispatch` uses strings, it's common to define a static field on the store itself so that it can be later used when dispatching. For example:

```jsx
@Action
SET_NAME(name) { /* ... */ }
static SET_NAME = "SET_NAME"
```

Later, one can use `dispatch(TheStore.SET_NAME, {name: "A name"})`.

Actions are synchronous by default, but can also be asynchronous. Asynchronous actions are indicated as follows:

```jsx
@Action({async: true})
ASYNC_ACTION(data) { /* ... */ }
```

