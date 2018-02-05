<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Installing Twist](#installing-twist)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Installing Twist

> **NOTE**: The easiest way to start using Twist is to use one of our pre-configured [starter projects](./starter-projects.md). These are pre-configured with Webpack, Babel, and various plugins to make Twist development easy.

Twist is available on [npm](https://www.npmjs.com/package/@twist/core). You can add it to your project as follows:

```bash
npm install --save @twist/core                   # core Twist features
npm install --save @twist/react                  # if you want React Twist bindings
npm install --save @twist/react-webpack-plugin   # if you're using webpack
```

# Configuring Twist

Twist needs to know what Twist libraries you intend to use in your project. This is accomplished by adding a `.twistrc` file to the root of your project.

For example, if you want to indicate that you're using the React Twist bindings from `@twist/react`, you'd create the following `.twistrc`:

```js
{
    "libraries": [
        "@twist/react"
    ]
}
```

## Using React Twist bindings with Webpack

If you want to use Twist and the React bindings with Webpack, you can use `@twist/react-webpack-plugin` in your webpack configuration. If you don't need to change any configuration settings, the following is sufficient to compile all `.jsx` files using the React Twist bindings:

```js
const ReactTwistPlugin = require('@twist/react-webpack-plugin');

module.exports = {
    /*...*/
    plugins: [
        /*...*/
        new ReactTwistPlugin()
        /*...*/
    ]
    /*...*/
}
```

For more examples of bundler configurations, [refer to the starter projects](./starter-projects.md).