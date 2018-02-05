<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Introduction to Twist](#introduction-to-twist)
  - [Important things to know](#important-things-to-know)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Introduction to Twist

Twist is a state management and container library for JavaScript. It combines some of the best ideas from both [Mobx](http://mobx.js.org) and [Redux](http://redux.js.org/). It is inspired by Mobx's **observables** and **mutable state**, while also using Redux's concepts of **stores** and **actions** to ensure a single pipeline through which state can be mutated. The former mutability allows for an extremely fast and performant state library, while the latter ensures that state is easily managed and tracked (including with time-travelling debugging tools). Twist also approaches front end development from the perspective of _state_ first, rather than the _view layer_ first, as is typical with many other frameworks. Twist has bindings for React now, and the community is invited to work on bindings for other frameworks.

Twist makes it incredibly easy to create performant, scaleable stateful applications. Twist makes it easy to:

* encapsulate your application state in a **centralized location**, outside of the views/components.
* **export/import your application state to/from JSON** – this is important for persistence, and server-side rendering.
* **debug changes to the application state** using the excellent [Redux Devtools Extension](https://github.com/zalmoxisus/redux-devtools-extension).

Twist can be used without any particular front-end framework, but Twist becomes even more powerful when combined with React using the [React bindings for Twist](https://github.com/adobe/react-twist). When combined with these bindings, it's easy to:

* create [**reactive components**](../fundamentals/components.md) that render in response to changes in stores.
* use [**declarative JSX extensions**](../reference/jsx/components/index.md) to perform iterations and conditionals.
* use **JSX extensions** to make it easy to work with CSS [styles](../reference/jsx/attributes/style.md) and [classes](../reference/jsx/attributes/class.md).

## Important things to know

Twist is built on modern JavaScript (ES2015 and above), and utilizes Babel to transpile the code to ES5 so that your code can run on a wide variety of browsers. As such, you should be familiar with the following ES2015+ concepts in order to effectively utilize Twist:

* Modules (`import` and `export`)
* Classes
* Arrow functions

In general, Twist tries to use standard ES2015+ features. However, there are a couple of features that Twist uses a lot that aren't yet fully standardized:

* Decorators
* Class Fields

> **Note**: Technically you _can_ use Twist without using decorators or class fields. However, these features are extremely useful and productive, and is what we'll use in all example code. If anyone in the community wants to add information on using Twist without decorators or class fields, pull requests are most welcome.
