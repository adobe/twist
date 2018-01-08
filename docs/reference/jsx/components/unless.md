<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [`<unless>`](#unless)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# `<unless>`

The `<unless>` structural component is the opposite of [`<if>`](./if.md). It takes a `condition` attribute, and renders the JSX that it contains if the condition is false, or no JSX if it's true.

Here's an example:

```jsx
export default <div>
    If you're happy and you know it
    <unless condition={ false }>
        clap you're hands
    </unless>
</div>;
```

The `<unless>` component is often coupled with [`<else>`](./else.md).
