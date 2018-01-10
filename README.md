# Twist: Reactive State-Management for JavaScript Applications

[![Build Status](https://travis-ci.org/adobe/twist.svg?branch=master)](https://travis-ci.org/adobe/twist)

A web application is a lot like an iceberg - what you see on the surface is just a tiny fraction of the complexity that lies beneath the waves. To a casual observer, it's easy to get absorbed by beautiful designs, and be amazed by how a little CSS and JavaScript can give rise to such immersive experiences. But the more complex an application becomes, the more critically it depends on a solid foundation - the nuts and bolts of component hierarchies, state management, and caching layers that hold the whole thing together.

Twist is a library that arose in light of these problems, by focusing on _application state_, and how it gets bound to _reusable UI components_. Twist is not a UI framework in its own right, but it does provide a syntax for writing components that's compatible with other frameworks, such as [React](https://reactjs.org/). It uses a _structured reactive_ approach, so that you easily scale your application, while maintaining an easy way of binding to the view - you'll recognize concepts that were inspired by [Mobx](http://mobx.js.org) and [Redux](http://redux.js.org/), which are both very popular state-management libraries for React.

To give you a feel for what Twist looks like, here's a small fragment of code, showing part of a model (a _store_), and part of a view (a _component_). Notice that stores can nest other stores (`DOB` and `Address` are also stores, but aren't shown):

```js
@Store
class User {
    @State.byVal name;
    @State.byVal description;
    @State.byRef(DOB) birthday;
    @State.byRef(Address) address;

    @Action CHANGE_DESCRIPTION(newDescription) {
        this.description = newDescription;
    }
}

@Component
class ProfileView {
    @Attribute user;
    @Observable newDescription;

    constructor() {
        super();
        this.newDescription = this.user.description;
    }

    render() {
        return <g>
            <div>Hello { this.user.name }!</div>
            <if condition={ this.user.birthday.isToday() }>
                <div>Happy Birthday!!</div>
            </if>
            <div>About yourself: <input bind:value={ this.newDescription }/></div>
            <button onClick={ () => this.user.dispatch('CHANGE_DESCRIPTION', this.newDescription) }>Save</button>
        </g>;
    }
}
```

The [Twist Documentation](docs/index.md) explains everything in great detail, but here's a preview of the main concepts:

* Application state is placed in _stores_ - these are _serializable_ to/from JSON, and the `@State.xxx` decorators tell Twist how to serialize each property (which can itself be another store).
* Stores are modified via _actions_ - this ensures that all changes go through a single bottleneck (the "dispatcher"), so that you can reason about all the changes to your state. In particular, this means that Twist supports time-traveling debugging, using the [Redux Devtools Extension](http://extension.remotedev.io/).
* Any state that can change is marked as _observable_, which allows Twist to know what to update when it changes (anything marked with `@State.xxx` is implicitly observable).
* UI components have _attributes_ as a means of passing in arguments, and a _render function_ that declaratively shows how to render the component (this uses JSX syntax). When anything observable changes that the component depends on, the rendered view will be automatically updated.

While the state portion of Twist is framework-agnostic, the implementation of components depends on which UI framework is used. Right now, Twist only supports React, via [React-Twist](https://github.com/adobe/react-twist), but it's designed so that there can be other implementations in the future (and we encourage contributions if you're interested in helping with this!). This would allow the same component to work with multiple UI frameworks, which would be great for shared component libraries! Even today, React-Twist makes it really easy to use Twist stores with React, and also adds a bunch of features on top of React to make your life easier. See [here](https://github.com/adobe/react-twist#features) for a complete description of the features.

> Note: In case you're wondering, React-Twist components _are_ React components - they just automatically optimize when to re-render, so you don't need to think about it. If you write a component in React-Twist, it can be used directly by a normal React application. Similarly, React-Twist components can use normal React components directly - everything is rendered via React and ReactDOM.

## Using Twist

If you want to use both the state-management and component layers of Twist, you'll need to install the following (via NPM or Yarn):

* `@twist/core` - This includes support for stores, data binding, and application state management.
* `@twist/react` - The React implementation of Twist components.
* `@twist/react-webpack-plugin` - A [webpack](https://webpack.js.org/) plugin that compiles Twist files (Twist has its own Babel transform that runs before React's).

If you're not using webpack, you can also get hold of the Babel configuration directly, using [`@twist/configuration`](https://github.com/adobe/twist-configuration) (this is done automatically by the webpack plugin).

After that, the only thing you need is a `.twistrc` file in the root of your project, that tells Twist which libraries to include (this is also used by the [Twist ESLint plugin](https://github.com/adobe/eslint-plugin-twist)). There are a number of advanced options, but to get up and running, you just need to tell Twist that you're using React-Twist:

```json
{
    "libraries": [
        "@twist/react"
    ]
}
```

In your `webpack.conf.js` you can now include the React Twist plugin - by default this will compile all files that end in `.jsx` with Twist and React:

```js
const ReactTwistPlugin = require('@twist/react-webpack-plugin');

module.exports = {
    ...
    plugins: [
        new ReactTwistPlugin(),
        ...
    ],
    ...
};
```
