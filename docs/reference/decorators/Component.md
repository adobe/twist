# @Component

The `@Component` decorator turns a class into a Twist component. These are used to encapsulate components, which can then be used inside of JSX.

> **NOTE**: The actual implementation and inheritance will depend upon the framework bindings you are using. This document describes Twist's abstract component behavior.

Usage:

```jsx
@Component({
    fork: boolean = false,
    events: Array[string] = [],
    throttleUpdates: boolean = true;
})
class MyComponent {
}
```

The decorator takes an object with its options, which are:
* **fork** A Boolean signifying whether or not to fork the scope when an instance of the component is created (default is false). See [Scope](./Scope.md) for more detail about scope.
* **events** An array of strings, defining the names of the events that the component can trigger. You can trigger an event by calling `this.trigger(eventName)` inside of the component. Events are bound to by `on<EventName>` attributes.
* **throttleUpdates** A boolean indicating whether or not updates should be throttled. While throttling updates can be beneficial for performance and is enabled by default, you may need more control over when updates occur. To disable throttling, pass `false`.

> **NOTE**: `Component` extends [`SignalDispatcher`](../core/SignalDispatcher) and [`Disposable`](../core/Disposable), so it inherits all of their methods. The `SignalDispatcher` APIs in particular are used for triggering and listening to events, and setting up programmatic watches.
