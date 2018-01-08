<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [@Memoize](#memoize)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

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
