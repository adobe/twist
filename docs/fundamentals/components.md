<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Components](#components)
  - [A simple Twist component](#a-simple-twist-component)
  - [Internal State](#internal-state)
  - [Attributes](#attributes)
    - [TODO:](#todo)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Components

Most modern UI frameworks (React, Vue, etc.) have the concept of **components**. A component, in short, is just an encapsulated bit of logic that interacts with and optionally renders a mapping of your app's state. You can combine (compose) these components together into interesting and complex user interfaces, while also gaining the benefits of modularity and reusability.

A Twist Component looks largely the same regardless of which UI framework you're targeting. That's because Twist components implement a consistent interface across all supported frameworks. Of course, if you're only targeting React, then you can still use React-specific functionality, but if you want your Twist component to work across the supported frameworks, then you'll want to write idiomatic Twist components.

## A simple Twist component

Let's take a quick look at what a simple Twist component would look like:

```jsx
@Component
class HelloWorld {
    render() {
        return <span>Hello, World</span>;
    }
}
```

We could then use this component in another component's `render` method like so:

```jsx
<HelloWorld />
```

## Internal State

A Twist component can have internal state by using [observables](./observables.md). By using observables you can react to any changes that might occur.

Let's create a simple clock component that maintains some internal state:

```jsx
@Component()
class Clock {
    @Observable date = new Date();

    @Bind
    update() {
        this.date = new Date();
    }

    componentDidMount() {
        setInterval(this.update, 1000);
    }

    render() {
        return <span>{this.date.toLocaleTimeString()}</span>;
    }
}
```

First, note that we define our clock's internal state by using `@Observable`, and we're creating a new class field called `date` and setting it to the current date (via `new Date()`). By instrumenting our `date` as observable, we can make changes to it and trigger a fresh rendering.

Next we create a method called `update` that will be responsible for updating the component's internal state. As you can see, it's really easy – we just assign a new `Date` instance to `this.date`. Because it's observable, anything that is bound to this value will be invalidated and re-evaluated.

But `update` on its own doesn't do anything – we have to trigger it somehow. The best place to do that is by using the `componentDidMount` lifecycle method. Once the instance is rendered in the DOM, this lifecycle method is called and we can create an interval that calls `update` every second.

> **NOTE**: Notice that when we defined `update` we prefixed it with `@Bind`. This is a convenience decorator that we can use to automatically bind the method to the instance. If we didn't do this, we'd have to do something like `setInterval(() => this.update, 1000)` to ensure that we were referring to the correct `this`.

Finally, we render the date's time portion in the `render` method. This will be updated every second because `update` will be modifying our component's internal state every second.

## Attributes

On its own, a component with no public interface doesn't provide a lot of functionality. We need a way to provide data to the component, as well as a way to respond to events that the component might trigger.

Components expose a public interface via **attributes**. If you're familiar with React, this is roughly equivalent to React's _props_. Twist uses the term **attribute** because this is the same term used when building HTML elements.

Attributes are defined by using the `@Attribute` decorator. These attributes are themselves observable. Let's create a timer component that will count down from a specified time.

```jsx
import PropTypes from "prop-types";

@Component
class Timer {
    @Attribute(PropTypes.number) seconds = 60;
    @Observable startTime;
    @Observable currentTime;

    get secondsRemaining() {
        return Math.max(
            Math.round(
                this.seconds - (this.currentTime - this.startTime) / 1000
            ),
            0
        );
    }

    @Bind
    update() {
        this.currentTime = performance.now();
    }

    componentDidMount() {
        this.startTime = performance.now();
        this.currentTime = this.startTime;
        setInterval(this.update, 1000);
    }

    render() {
        return <span>{this.secondsRemaining}</span>;
    }
}
```

In this example, we're mixing observables with attributes. We need some internal state to track the actual elapsed time (`setInterval` isn't actually terribly accurate), and we also need to expose an external interface so that a consumer can pass in a specific number of seconds from which we can count down. For example:

```jsx
<Timer seconds={60} />
```

We've also done something else interesting in this component: the actual seconds remaining is calculated in a getter. The `render` method will _still_ be triggered whenever the `currentTime` observable is updated, even though the `render` method doesn't _directly_ reference `currentTime`.

### TODO:

* `ref` should be a reference, not a function
* `render` should only ever be a `return` with JSX. (no other logic)
* prefer structural components (if, repeat, etc.)
* events are always internal browser events (not synthetic events)
* style-, class-
