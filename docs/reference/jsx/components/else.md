<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [`<else>`](#else)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# `<else>`

The `<else>` structural component is used immediately after an [`<if>`](./if.md), an [`<elseif>`](./elseif.md), or an [`<unless>`](./unless.md). When it comes after an `<if>`, it renders the JSX that it contains if the condition on the `<if>` is false, otherwise it renders nothing.

Here's an example with `<if><else>`:

```jsx
export default <g>
  The condition is
    <if condition={ true }>
        truthy.
    </if>
    <else>
        falsy.
    </else>
</g>;
```

And here's an example with `<unless><else>`:

```jsx
export default <g>
  The condition is
    <unless condition={ true }>
        falsy.
    </unless>
    <else>
        truthy.
    </else>
</g>;
```
