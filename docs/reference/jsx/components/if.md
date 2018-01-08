<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [`<if>`](#if)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# `<if>`

The `<if>` structural component is your basic conditional. It takes a `condition` attribute, and renders the JSX that it contains if the condition is true, or no JSX if it's false.

Here's an example:

```jsx
export default <div>
    If you're happy and you know it
    <if condition={ true }>
        clap your hands
    </if>
</div>;
```

The `<if>` component is often coupled with [`<else>`](./else.md) and [`<elseif>`](./elseif.md).
