# Introduction to Twist

Twist is a state management and container library for JavaScript. It melds some of the best ideas from both [Mobx](http://mobx.js.org) and [Redux](http://redux.js.org/). It is inspired by Mobx's **observables** and **mutable state**, while also using Redux's concepts of **stores** and **actions** to ensure a single pipeline through which state can be mutated. The former mutability allows for an extremely fast and performant state library, while the latter ensures that state is easily managed and tracked (including with time-travelling debugigng tools).

Twist makes it incredibly easy to create performant, scaleable stateful applications. Twist makes it easy to:

* encapsulate your application state in a **centralized location**, outside of the views/components.
* **export/import your application state to/from JSON** – this is important for persistence, and server-side rendering.
* **debug changes to the application state** using the excellent [Redux Devtools Extension](https://github.com/zalmoxisus/redux-devtools-extension).

Twist can be used without any particular front-end framework, but Twist becomes even more powerful when combined with React using the [React bindings for Twist](#). When combined with these bindings, it's easy to:

* create **reactive** components that rerender in response to changes in stores
* use **declarative JSX extensions** to perform iterations and conditionals
* use **JSX extensions** to make it easy to add styling and class changes

## Important things to know

Twist is built on modern JavaScript (ES2015 and above), and utilizes Babel to transpile the code to ES5 so that your code can run on a wide variety of browsers. As such, you should be familiar with the following ES2015+ concepts in order to effectively utilize Twist:

* Modules (`import` and `export`)
* Classes
* Arrow functions

In general, Twist tries to use standard ES2015+ features. However, there are a couple of features that Twist uses alot that aren't yet fully standardized:

* Decorators
* Class Fields

> **Note**: Technically you _can_ use Twist without using decorators or class fields. However, these features are extremely useful and productive, and is what we'll use in all example code.
