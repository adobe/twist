<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [@Component](#component)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# @Component

The `@Component` decorator turns a class into a Twist component. These are used to encapsulate components, which can then be used inside of JSX.

> **NOTE**: The actual implementation and inheritance will depend upon the framework bindings you are using. This document describes Twist's abstract component behavior.

Usage:

```jsx
@Component({
    fork: boolean = true,
    events: Array[string] = [];
})
class MyComponent {
}
```

The decorator takes an object with its options, which are:
* **fork** A Boolean signifying whether or not to fork the scope when an instance of the component is created (default is true). See [Scope](../core/Scope.md) for more detail about scope.
* **events** An array of strings, defining the names of the events that the component can trigger. You can trigger an event by calling `this.trigger(eventName)` inside of the component. Events are bound to by `on<EventName>` attributes.

> **NOTE**: `Component` extends [`SignalDispatcher`](../core/SignalDispatcher.md) and [`Disposable`](../core/Disposable.md), so it inherits all of their methods. The `SignalDispatcher` APIs in particular are used for triggering and listening to events, and setting up programmatic watches.
