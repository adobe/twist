# Disposable

`Disposable` is a very common base class in Twist - [`SignalDispatcher`](./SignalDispatcher.md) and [`Component`](#../decorators/component.md) all inherit from it. It provides a `dispose()` method, which can handle cleaning up of resources after the object is no longer needed, and methods for linking other disposable objects to it. Anything "linked" will also be disposed when the containing object is disposed.

You can also create your own subclasses of `Disposable`, as the following example shows:

```jsx
import { Disposable } from '@twist/core';

class A extends Disposable {

    dispose() {
        super.dispose();
        console.log('A Disposed')
    }
}

class B extends Disposable {

    constructor() {
        super();
        this.a = this.link(new A());
        this.link(() => console.log('Link Disposed'));
    }
}

// The following will output to the console:
// > A Disposed
// > Link Disposed
new B().dispose();
```

As you can see, you can either pass a `Disposable` object or a function to `link()` - if you pass in a function, it will get called at `dispose()` time.

There's one important thing to remember - if you override `dispose()`, you must remember to call `super.dispose()` as well, otherwise the links won't get disposed! If you're worried about remembering this, you can always put your disposal logic in another method (e.g. `onDispose`), and link it like so:

```jsx
this.link(() => this.onDispose());
```

## Instance Methods

| Method   | Description |
| -------- | ----------- |
| `link(instance: Disposable|Function)`        | Links `instance` to the object, so it gets disposed (or called) when `dispose()` is called. Returns `instance`. |
| `unlink(instance: Disposiable|Function)`      | Unlinks `instance`, so it will no longer get disposed (or called) when `dispose()` is called. |
| `disposeLink(instance: Disposable|Function)` | Unlinks `instance`, and also immediately disposes (or calls) it. |
| `dispose()`      | Disposes the object, along with everything that's linked to it. |
