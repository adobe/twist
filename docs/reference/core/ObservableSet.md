<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [ObservableSet](#observableset)
  - [Constructor](#constructor)
  - [Properties](#properties)
  - [Methods](#methods)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# ObservableSet

`ObservableSet` is an observable wrapper over a JavaScript [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set). It allows Twist to detect when the contents of the set changes, so that reactivity works as expected.

> **NOTE**: `ObservableSet` is not currently iterable from JavaScript, unlike a `Set` - this capability will be added in future.

## Constructor

The constructor can optionally be supplied a `Set`, or an `Iterable` object:

```jsx
import { ObservableSet } from '@twist/core';

var set1 = new ObservableSet;
console.log(set1.size); // 0

var set2 = new ObservableSet([ 1, 2, 3, 3 ]);
console.log(set2.size); // 3 (sets can't contain duplicates)

var set3 = new ObservableSet(new Set([ 1, 2 ]));
console.log(set3.size); // 2
```

## Properties

| Property | Description |
|----------|-------------|
| `length` | Alias for `size` |
| `size` | Returns the number of elements in the set |

## Methods

| Method | Description |
|--------|-------------|
| [`add()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/add) | Adds an element to the set |
| [`clear()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/clear) | Removes all elements from the set |
| [`delete()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/delete) | Deletes the element from the set |
| [`entries()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/entries) | Returns a new `Iterator` object that contains the elements in the set |
| [`forEach()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/forEach) | Iterates over the elements in the set |
| [`has()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/has) | Returns a Boolean indicating the presence of an element in the set |
| [`keys()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/keys) | Alias for `values()` |
| [`values()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/values) | Returns a new `Iterator` object that contains the elements in the set |
