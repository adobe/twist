# @Memoize

The `@Memoize` decorator lets you modify a getter so that it caches the result of executing the getter, and returns that on subsequent calls. This is a nice shortcut for implementing the singleton pattern. Note that if the getter has side effects, or you expect the data it returns to change, you should _not_ memoize it.

Usage:

```jsx
class C {
    @Memoize
    get instanceProperty() {
    }

    @Memoize
    static get classProperty() {
    }
}
```

Here's an example that creates a singleton - a single instance of a component called `MyComponent`:

```jsx
@Component
class MyComponent {
    @Observable name = "singleton";

    @Memoize
    static get instance() {
        return new this();
    }
}

export default <g>
    <b> { MyComponent.instance.name } </b>
</g>
```
