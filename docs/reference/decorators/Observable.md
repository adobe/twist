<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [@Observable](#observable)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# @Observable

The `@Observable` decorator allows Twist to observe a property of a class. Under the hood, this sets up a getter and setter for the property, so that Twist can track which expressions depend on it, and when it changes. 

Usage:

```jsx
class C {
    @Observable instanceProperty;
    @Observable instancePropertyWithDefault = 2;

    @Observable static classProperty;
    @Observable static classPropertyWithDefault = 2;
}
```

You can use `@Observable` on properties of any class (whether or not it's a component), and also for `static` properties. In a component, use `@Observable` for private state, and [@Attribute](./Attribute.md) for state that's exposed to the component's consumer.

Here's a concrete example:

```jsx
class Data {
    @Observable static size = 5;
}

export default <g>
    <div>
        Update the slider to set Data.size indirectly <br />
        <input type="range" min={1} max={50} bind:value={Data.size} />
    </div>
    <div>
        Or click a button to set Data.size directly, and watch the border update in response.
        <input type="button" value="Set size to 1" onClick={ () => Data.size = 1 } />
        <input type="button" value="Set size to 5" onClick={ () => Data.size = 5 } />
    </div>

    <div style-width='100px' style-border="1px solid red" style-border-width={ Data.size }>Border width binding example</div>
</g>;
```

TODO: verify above example
