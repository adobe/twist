<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Observables](#observables)
  - [Bindings](#bindings)
  - [Reactivity](#reactivity)
  - [Non-primitive fields](#non-primitive-fields)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Observables

Twist is built around the concepts of **observables** and **reactivity**. To accomplish this, Twist relies upon you to _instrument_ your data model and stores by indicating which of your model's fields should be observed. You can then build your app to respond to changes on those fields using **watches** or other components that are designed to track references for you automatically.

An observable is a class field that has been instrumented with the [`@Observable`](../reference/decorators/Observable.md) decorator. This decorator will automatically create a getter and a setter to track references and changes to the field.

## Bindings

An observable tracks references, or **bindings**, to observables whenever those fields are accessed. By keeping track of those accesses, it's possible to build a dependency tree during runtime. Then, should any dependency be invalidated, the other bindings can also be invalidated and then re-evaluated.

## Reactivity

Whenever a field is modified, the associated bindings are automatically invalidated and re-evaluated. When this occurs, notifications are generated which indicate that a change has occurred. You can subscribe to these notifications by using the `watch` method on any class that inherits from [`SignalDispatcher`](../reference/core/SignalDispatcher.md).

## Non-primitive fields

The `@Observable` decorator only works with primitive fields – that is, fields that are of a primitive type (like a number or string). In order to observe changes within an `Array`, `Set`, or `Map`, one must create an observable instance. Twist provides an observable wrapper for each case: [`ObservableArray`](../core/ObservableArray.md), [`ObservableSet`](../core/ObservableSet.md), and [`ObservableMap`](.../core/ObservableMap.md). In each case, the methods you would expect are present, although `ObservableArray`s are not indexed using brackets as are `Array`s. Instead you can use `at` and `setAt`. For example:

`Array` instance   | `ObservableArray` instance
-------------------|---------------------------
`const x = a[1];`  | `const x = a.at(1);`
`a[2] = x;`        | `a.setAt(2, x);`