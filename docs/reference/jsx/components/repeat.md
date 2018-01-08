<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [`<repeat>`](#repeat)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# `<repeat>`

The `<repeat>` structural component allows you to iterate over the contents of a collection. There are two different ways of using `<repeat>`:

1. Use the `for` attribute to bind to an expression of the form `<variableName> in <expression>`, e.g. `for={ item in list }`.
2. Use the `collection` attribute to bind to an expression that evaluates to an array, and the `as` attribute to specify a variable to assign each item to (this is the same use of `as` as the [`using`](./using.md) component uses).

Here's an example with `<repeat for>`:

```jsx
var fruits = [ "apple", "orange", "watermelon" ];
export default <ul>
    <repeat for={ item in fruits }>
        <li>{ item }</li>
    </repeat>
</ul>;
```

And here's the same example with `<repeat collection as>`:

```jsx
var fruits = [ "apple", "orange", "watermelon" ];
export default <ul>
    <repeat collection={ fruits } as={ item }>
        <li>{ item }</li>
    </repeat>
</ul>;
```

In both cases, this renders the following in the DOM (the `<repeat>` component is virtual, so it doesn't appear in the DOM):

```html
<ul>
    <li>apple</li>
    <li>orange</li>
    <li>watermelon</li>
</ul>
```

Note that if the array contents can change, you need to use an [`ObservableArray`](../core/ObservableArray.md) in order for reactivity to work - otherwise, Twist won't know to re-render when items in the list change.
