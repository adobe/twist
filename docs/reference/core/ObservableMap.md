# ObservableMap

`ObservableMap` is an observable wrapper over a JavaScript [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map). It allows Twist to detect when the contents of the map changes, so that reactivity can work as expected.

> **NOTE**:  an `ObservableMap` is not currently iterable from JavaScript, unlike a `Map` - this capability will be added in future.

## Constructor

The constructor can optionally be supplied a `Map`, or an object:

```jsx
import { ObservableMap } from '@twist/core';

var map1 = new ObservableMap;
console.log(map1.size); // 0

var map2 = new ObservableMap({x: 1, y: 2});
console.log(map2.size); // 2

var map3 = new ObservableMap(new Map([ [ 'x', 1 ], [ 'y', 2 ] ]));
console.log(map3.size); // 2
```

## Properties

| Property | Description |
|----------|-------------|
| `length` | Alias for `size` |
| `size` | Returns the number of keys in the map |

## Methods

| Method | Description |
|--------|-------------|
| `clear()` | Removes all entries from the map |
| `delete()` | Deletes the entry under a given key |
| [`entries()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/entries) | Returns a new `Iterator` object that contains the key/value pairs in the map |
| [`forEach()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/forEach) | Iterates over the entries in the map |
| `get()` | Returns the value stored for a given key |
| `has()` | Returns a Boolean indicating the presence of a given key |
| [`keys()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/keys) | Returns a new `Iterator` object that contains the keys in the map |
| `set()` | Creates a new entry in the map |
| [`values()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/values) | Returns a new `Iterator` object that contains the values in the map |
