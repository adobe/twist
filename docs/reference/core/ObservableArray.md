# ObservableArray

`ObservableArray` is an observable wrapper over JavaScript arrays. It allows Twist to know when the contents of the array changes, so that any bindings can be invalidated and reevaluated.

Note that you can't use the normal array indexing with an `ObservableArray`, because this is restricted to primitive arrays in JavaScript. This means:

* Use `observableArray.at(i)` where you would use `array[i]`.
* Use `observableArray.setAt(i, x)` where you would use `array[i] = x`.
* Use `observableArray.forEach(item => ...)` where you would use `for(var item in array) { ... }.`

> **NOTE**: In a [`<repeat>`](../jsx/components/repeat), however, you can iterate over an `ObservableArray` in precisely the same way as a normal array. This is because the `<repeat>` implementation knows about `ObservableArray`, and can iterate over it correctly.

## Constructor

The constructor can optionally be supplied an array:

```jsx
import { ObservableArray } from '@twist/core';

var array1 = new ObservableArray;
console.log(array1.length); // 0

var array2 = new ObservableArray([ 1, 2 ]);
console.log(array2.length); // 2
```

## Properties

| Property | Description |
|----------|-------------|
| `length` | Sets or returns the number of elements in an array |

## Methods

Methods specific to `ObservableArray`:

| Method | Description |
|--------|-------------|
| `at()` | Returns the element in the array at the given index |
| `removeItem()` | Removes an item from the array (shorthand for `indexOf`/`splice`) |
| `setAt()` | Sets the element at a given index in the array |
| `swapItems()` | Replaces the entire contents of the array with another array |
| `toArray()` | Returns a clone of the underlying array |
| `concatToArray()` | Same as `concat()`, but returns a plain array rather than an `ObservableArray` |
| `mapToArray()` | Same as `map()`, but returns a plain array rather than an `ObservableArray` |
| `filterToArray()` | Same as `filter()`, but returns a plain array rather than an `ObservableArray` |
| `sliceToArray()` | Same as `slice()`, but returns a plain array rather than an `ObservableArray` |
| `spliceToArray()` | Same as `splice()`, but returns a plain array rather than an `ObservableArray` |

> **NOTE**: If you want a plain array, `concatToArray()` is more efficient than `concat.toArray()`, since it avoids the extra copy operation of `toArray()`.

Methods inherited from `Array`:

| Method | Description |
|--------|-------------|
| [`concat()`](https://www.w3schools.com/jsref/jsref_concat_array.asp) | Joins two or more arrays, and returns a copy of the joined arrays as an ObservableArray |
| [`copyWithin()`](https://www.w3schools.com/jsref/jsref_copywithin.asp) | Copies array elements within the array, to and from specified positions |
| [`every()`](https://www.w3schools.com/jsref/jsref_every.asp) | Checks if every element in an array pass a test |
| [`fill()`](https://www.w3schools.com/jsref/jsref_fill.asp) | Fill the elements in an array with a static value |
| [`filter()`](https://www.w3schools.com/jsref/jsref_filter.asp) | Creates a new array with every element in an array that pass a test |
| [`find()`](https://www.w3schools.com/jsref/jsref_find.asp) | Returns the value of the first element in an array that pass a test |
| [`findIndex()`](https://www.w3schools.com/jsref/jsref_findindex.asp) | Returns the index of the first element in an array that pass a test |
| [`forEach()`](https://www.w3schools.com/jsref/jsref_forEach.asp) | Calls a function for each array element |
| [`indexOf()`](https://www.w3schools.com/jsref/jsref_indexof_array.asp) | Search the array for an element and returns its position |
| [`isArray()`](https://www.w3schools.com/jsref/jsref_isarray.asp) | Checks whether an object is an array |
| [`join()`](https://www.w3schools.com/jsref/jsref_join.asp) | Joins all elements of an array into a string |
| [`lastIndexOf()`](https://www.w3schools.com/jsref/jsref_lastindexof_array.asp) | Search the array for an element, starting at the end, and returns its position |
| [`map()`](https://www.w3schools.com/jsref/jsref_map.asp) | Creates a new array with the result of calling a function for each array element |
| [`pop()`](https://www.w3schools.com/jsref/jsref_pop.asp) | Removes the last element of an array, and returns that element |
| [`push()`](https://www.w3schools.com/jsref/jsref_push.asp) | Adds new elements to the end of an array, and returns the new length |
| [`reduce()`](https://www.w3schools.com/jsref/jsref_reduce.asp) | Reduce the values of an array to a single value (going left-to-right) |
| [`reduceRight()`](https://www.w3schools.com/jsref/jsref_reduceright.asp) | Reduce the values of an array to a single value (going right-to-left) |
| [`reverse()`](https://www.w3schools.com/jsref/jsref_reverse.asp) | Reverses the order of the elements in an array |
| [`shift()`](https://www.w3schools.com/jsref/jsref_shift.asp) | Removes the first element of an array, and returns that element |
| [`slice()`](https://www.w3schools.com/jsref/jsref_slice_array.asp) | Selects a part of an array, and returns the new array |
| [`some()`](https://www.w3schools.com/jsref/jsref_some.asp) | Checks if any of the elements in an array pass a test |
| [`sort()`](https://www.w3schools.com/jsref/jsref_sort.asp) | Sorts the elements of an array |
| [`splice()`](https://www.w3schools.com/jsref/jsref_splice.asp) | Adds/Removes elements from an array |
| [`toString()`](https://www.w3schools.com/jsref/jsref_tostring_array.asp) | Converts an array to a string, and returns the result |
| [`unshift()`](https://www.w3schools.com/jsref/jsref_unshift.asp) | Adds new elements to the beginning of an array, and returns the new length |
| [`valueOf()`](https://www.w3schools.com/jsref/jsref_valueof_array.asp) | Returns the primitive value of an array |
