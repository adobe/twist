<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [`as`](#as)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# `as`

The `as` attribute is used with the [`<repeat>`](../components/repeat.md) and [`<using>`](../components/using.md) structural components to define a local variable. This variable can be used inside any JSX expressions within the element that defines it.

Here's an example of the `as` attribute being used with `<repeat>`:

```jsx
import { ObservableArray } from "@twist/core";

var numbers = new ObservableArray;

var nodes = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'];

export default <g>
    <button onClick={ () => numbers.push(Math.floor(Math.random() * 5) + 1) }> Roll </button>
    <br/>
    <repeat collection={ numbers } as={ number } >
       <div> { number } : { nodes[number] } </div>
    </repeat>
</g>;
```

> **NOTE**: The `as` attribute is reserved (it has a special semantics), meaning that you shouldn't use it as an attribute name for a custom component - if you do, reactivity won't work as expected.
