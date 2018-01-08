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
