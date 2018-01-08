# SignalDispatcher

`SignalDispatcher` is a useful base class for objects that need to implement reactivity and dispatch and handle events. For example, [`Component`](#../decorators/component) inherits from `SignalDispatcher`.

A `SignalDispatcher` has a `watch()` method that's useful for programmatically reacting to changes on an expression. Here's an example, using a component as the instance of `SignalDispatcher`:

```jsx
@Component
export default class MyComponent {

    @Observable value = 2;
    @Observable computedValue;

    constructor() {
        super();

        this.watch(() => this.value, value => {
            this.computedValue = 2 ** Number(this.value);
        });
    }

    render() {
        return <g>
            <div>Value: <input bind:value={ this.value } /></div>
            <div>Computed Value: { this.computedValue }</div>
        </g>;
    }
}
```

This is a contrived example, because you could have just bound directly to the computation from the JSX, but sometimes you need to do something programmatically when a value changes - that's what watches are for!

`SignalDispatcher` also comes with a number of methods for handling events. The basic building blocks are `trigger()` for triggering events, and `on()` and `off()` for registering event listeners. Here's an example:

```jsx
import { SignalDispatcher } from '@twist/core';

class MyDispatcher extends SignalDispatcher {
}

@Component
export default class MyComponent {

    constructor() {
        super();
        this.dispatcher = this.link(new MyDispatcher());
    }

    @Bind
    onEvent() {
        alert('Event Fired!')
    }

    render() {
        return <g>
            <button onClick={ () => this.dispatcher.on('event', this.onEvent) }>Add Listener</button>
            <button onClick={ () => this.dispatcher.off('event', this.onEvent) }>Remove Listener</button>
            <button onClick={ () => this.dispatcher.trigger('event') }>Trigger Event</button>
        </g>;
    }
}
```


## Instance Methods

| Method   | Description |
| -------- | ----------- |
| `watch(fn, callback)`                 | Watch the result of evaluating `fn()`. Whenever the value of `fn()` changes, `callback` will be invoked with the new value. |
| `watchCollection(fn, callback)`       | Shallow watch the collection that's the result of evaluating `fn()`. Whenever the collection changes, `callback` will be invoked with the collection. |
| `multiWatch(fns, callback)`           | Watch an array of values - the results of evaluating each function in `fns`. Whenever any of the values changes, `callback` will be invoked with an array containing the new values. |
| `defineObservable(key, defaultValue)` | Define a new observable property `key`, with a default value of `defaultValue`. This is equivalent to instrumenting with [`@Observable`](../decorators/observable.md) (i.e. `@Observable key = defaultValue`). |
| `dispose()`                           | Same as `Disposable.dispose` (see [`Disposable`](./Disposable.md)), but also stops all listeners. |
| `trigger(name, ...args)`              | Trigger the event `name` (a string) - any additional arguments are passed to the event handlers |
| `on(name, callback)`                  | Register `callback` as a listener for the event `name`. |
| `off(name, callback)`                 | Unregister `callback` as a listener for the event `name`. |
| `listenTo(object, name, method)`      | Register `method` as a listener for the event `name` on `object` - `method` will automatically get bound to `this`. |
| `stopListening(object, name, method)` | Unregister `method` as a listener for the event `name` on `object` |

Note that `SignalDispatcher` extends [`Disposable`](./Disposable.md), so it inherits all of its methods.

To understand the difference between `on` and `listenTo`, it's useful to realize that `this.listenTo(myObject, 'event', this.onEvent)` is equivalent to:

```jsx
var handler = this.onEvent.bind(this)
myObject.on('event', handler);
this.link(() => myObject.off('event', handler));
```

In other words, `listenTo` is just a shorthand for registering an event handler on another object, and making sure that it gets unregistered when the target object is `disposed`.
