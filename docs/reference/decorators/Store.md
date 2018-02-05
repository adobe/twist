# @Store

Indicates that the following class is a serializable store. Serializable fields are marked with [`@State`](./State.md) decorators.

## Mutable vs. Immutable Stores

Internally, Twist stores are all mutable, however, by default, only methods marked with an [`@Action`](./Action.md) decorator can actually mutate that state. This is usually the desired behavior. It makes stores, state, and the flow of data easy to reason about. There are times, however, when you might want a store that permits mutations on fields directly &mdash; the most typical case is a form that is using `bind:` two-way data binding.

To indicate that a store should be mutable, the following can be used:

```jsx
@Store({mutable: true})
class MutableStore {
    @State.byNumberVal n;
}
```

If the store were immutable, writing something like `mutableStore.n = 100` would throw an error. But mutable stores will translate this attempt to an implicit action and update the store. Note that in all cases, actions are the only way to update the data within a store (this is to ensure that time traveling works), but when updating a field on a mutable store, an _implicit action_ is created for you.

## Serialization

Stores are easily serializable to and from JSON:

* `toJSON()` will return a dictionary containing the data within the store's fields. Methods are stripped. This object is suitable for passing to `JSON.stringify`.
* `fromJSON(data)` will populate the store from the `data` dictionary based upon the store's field types. If using `JSON.stringify` to store serialized data, be sure to call `JSON.parse` _first_ to get a valid object before calling `#fromJSON`.
