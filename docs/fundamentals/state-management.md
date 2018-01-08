<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [State Management](#state-management)
  - [Decoupling Models from Views](#decoupling-models-from-views)
  - [Sharing State with Scopes](#sharing-state-with-scopes)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# State Management

Components are great for building UI components and managing the view layer of your application. But what about the application's _state_? Keeping state in UI components is generally a bad idea, unless that state is tightly coupled to the view - for example, it's good to store the "checked" state of a checkbox inside the control, but it's bad to store the details of the logged in user.

The great news in Twist is that all the observable primitives you've seen (`@Observable`, `ObservableArray`, `ObservableMap`, etc) - aren't restricted to components. They can be used anywhere in your application, to give you complete flexibility over how you structure your model. The only one that doesn't make sense outside of a component is `@Attribute`, because that exposes a JSX interface for setting the property - in other contexts, `@Observable` suffices.

## Decoupling Models from Views

Let's say you want to create some classes to represent the data model of your application - for example, the state of the logged in user:

```jsx
class UserData {
    @Observable name;
    @Observable email;
    @Observable address;
}
```

That was easy! You just instrument your classes with `@Observable` - any view that accesses one of these fields will now get automatically updated when it changes.

The next question is where to store your state? One approach would be to create a singleton that stores the state (like a global variable) that can be imported and accessed from anywhere in your app. This leads to problems if you later need to have multiple instances running at the same time - it's a lot of effort to go back and refactor all of your global state. Another approach would be to pass the state around your components using attributes, but this quickly gets messy - especially if your component hierarchy is very deep.

To solve this problem more cleanly, Twist has a mechanism called **scopes**.

## Sharing State with Scopes

In Twist, a **scope** is an object that's shared by a component and all of its children. It's accessible within any component, via `this.scope`. At the point you attach your application to the DOM, Twist creates a global scope that gets shared by all the components you create.

Let's take a look at an example, using scopes to share an instance of `UserData` throughout an application:

```javascript
@Component({fork: true})
class MyContainer {
    constructor() {
        super();
        this.scope.userData = new UserData();
    }

    render() {
        return <MyComponent />;
    }
}

@Component
class MyComponent {
    render() {
        return <div>{ this.scope.userData.name }</div>;
    }
}
```

Here, `MyComponent` has direct access to `userData` because it was placed on the scope by its parent component - in both components, `this.scope` is the same object. 

Scopes in Twist are inherited prototypically, so when you fork a scope, it means you still have _read_ access to anything on the scope in the context where your component is used. But anything you _write_ to the scope won't be visible outside of your component and its children. Also, when the component is disposed, its forked scope will be disposed at the same time - there's no need for you to manually clean it up. As a rule of thumb, if you're adding anything to the scope, you should be forking it!

One subtlety to bear in mind, is if you add an object to the scope (or anywhere else on the component) that holds resources that need to be cleaned up later. In this case, you need to dispose it when the component is disposed. Twist provides an easy shortcut for this, by using the `link` method on a component. You can write:

```jsx
this.scope.userData = this.link(new UserData());
```

This tells Twist to call `this.scope.userData.dispose()` when the component is disposed - you just add a `dispose` method to `UserData` with your cleanup logic. If you have a tree of objects that all need to get disposed, it's a good idea to inherit from [`Disposable`](../reference/core/Disposable.md). This gives each class access to `link`, as well as a default `dispose` method that disposes your links (just remember to call `super();` when you override `dispose`).
