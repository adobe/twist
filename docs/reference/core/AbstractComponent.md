<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Abstract Component](#abstract-component)
  - [Inheritance](#inheritance)
  - [Component Lifecycle](#component-lifecycle)
    - [`constructor`](#constructor)
    - [`render`](#render)
    - [`componentWillMount`](#componentwillmount)
    - [`componentDidMount`](#componentdidmount)
    - [`componentWillUnMount`](#componentwillunmount)
  - [Component APIs](#component-apis)
  - [Component Features](#component-features)
  - [Events](#events)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Abstract Component

Twist assumes an "abstract component" specification that is implemented by any view layer framework bindings. For example, [React Twist](https://github.com/adobe/react-twist) implements everything within this specification using React-specific code.

## Inheritance

A component inherits from [`SignalDispatcher`](./SignalDispatcher.md) and [`Disposable`](./Disposable.md). As such, all the methods and functionality provided by those classes are also provided by Twist components, including `watch`, `dispose`, `trigger`, etc.

## Component Lifecycle

A Twist component uses the following methods from the React component lifecycle, namely:

* `constructor`
* `render`
* `componentWillMount`
* `componentDidMount`
* `componentWillUnmount`

### `constructor`

When working with other bindings, it might be tempting to call `super` as you would idiomatically. For example, when working in React, you might want to pass `props` and `context` to `super`. This should be avoided.

```jsx
constructor() {
    super();
    /* continue your initialization */
}
```

### `render`

Most view layers will allow arbitrary logic within the `render` method. You can, of course, use arbitrary logic within Twist components, but if you want these components to be idiomatic and portable, you should follow these guidelines:

* Only have one `return` value
* The `return` value should return JSX
* **Don't** perform any additional logic within the `render` method beyond the `return` statement
* A `ref` attribute should refer to a class field rather than be a function
* Use structural components instead of Javascript constructs to iterate and render conditionally

### `componentWillMount`

This method is called just prior to the component being mounted in the DOM.

### `componentDidMount`

This method is called just after the component is mounted in the DOM.

### `componentWillUnMount`

This method is called just prior to the component being removed from the DOM.

## Component APIs

A Twist component provides the following members:

* Properties
    * `scope` is a reference to state shared between a tree of components. It's _similar_ to React's `context`, but easier to use and understand. See [Scope](./Scope.md) for more information.
    * `children` is an observable collection containing all the component's child elements.
* Methods
    * `undeclaredAttributes()` allows one to access any extra attributes passed in via a consumer that aren't explicitly defined with an `@Attribute` decorator. Useful for when you need to spread additional attributes to children.
    * `renderChildren([...args])` allows one to pass arguments to children using the `as` attribute.
    * `renderChildren(name)` enables rendering of namespaced children (for example, `<dialog:footer />`)
    * `renderChildren(name, [...args])` allows one to pass arguments to a namespaced child

## Component Features

A Twist component must provide for the following:

* Reactive rendering whenever observables and attributes change
* Two-way data binding via `bind:` attribute namespace
* `class` attributes
    * Allow `class` as an attribute (in addition to `className`
    * Concatenate multiple `class` attributes into a single string
    * Boolean attributes: `<div class-selected={ this.selected } >` will only apply `selected` to the element's `class` if `this.selected` is `true`.
* `style` attributes
    * Individual styles can be targeted via `style-*`; for example: `style-background-color: 'red'`.
    * Styles aren't required to be objects; they can be strings.

## Events

View-layer frameworks take different approaches to event handling. Some will try to hide browser differences between events and others will only pass the actual browser-generated event. Twist components will _always_ pass the underlying browser event. If you need to abstract away browser differences, there are other libraries that can be used to do so.