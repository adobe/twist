# @Cache

The `@Cache` decorator lets you modify a getter so that it caches the result of executing the getter in an intermediate observable (under the hood). This intermediate observable will get updated only when any observables that the getter depends on are changed. This is useful if the computation in the getter is expensive.

Usage:

```jsx
class C extends Disposable {
    @Cache
    get instanceProperty() {
    }
}
```

Note that because `@Cache` uses observables the hood, it can only be used on a class that inherits from [`Disposable`](../core/Disposable.md) - this includes [`@Component`](./Component.md) and [`@Store`](./Store.md), which inherit from `Disposable`. This ensures that the observable is disposed whenever an instance of the class is disposed. Similarly, `@Cache` can't be used on a static getter, because there's no way to dispose the observable it creates (this could lead to memory leaks).

`@Cache` differs from [`@Memoize`](./Memoize.md) in that the latter will only ever execute the getter once (never subsequently updating), whereas the former will re-evaluate the getter whenever any observables it depends on change.

To understand when to use `@Cache`, let's consider a concrete example:

```jsx
@Component
class MyComponent {

    @Observable x;

    get value() {
        return f(this.x);
    }

    render() {
        return <g>
            <div>{ this.value }</div>
            <div>{ this.value }</div>
        </g>
    }
}
```

Here, we have a getter (`value`) that returns some function of the observable property `x`. In the above example, whenever `this.x` changes, the two data bindings for `this.value` will be invalidated (because they depend on `this.x`), and the `render` method will be executed. This means that whenever `this.x` changes, `f(this.x)` will be executed _twice_.

Most of the time this is not a problem, but if `f()` is an expensive computation, it would be nice to avoid executing it more often than necessary. By decorating the getter for `value` with `@Cache`, the result of `f(this.x)` is stored in an intermediate observable, and only computed once when `this.x` changes. Since the bindings to `this.value` just pull directly from the intermediate observable, `f(this.x)` will only be executed _once_ whenever `f(this.x)` changes.

Since `@Cache` is a tradeoff - it adds to memory usage, and a bit of overhead to the getter - only use it when the computation is sufficiently expensive and/or widely used to benefit from caching.
