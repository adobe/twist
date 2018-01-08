# DevTools Middleware

[Redux-devtools-extension](https://github.com/zalmoxisus/redux-devtools-extension) is a browser plugin for Chrome/Firefox (and also Electron), that was built for debugging Redux applications. Twist comes bundled with middleware for connecting to this, so it's really easy to debug your store. Just pass in the middleware when creating your store:

```javascript
import { remoteDevMiddleware } from '@twist/core';

var store = new MyStore(INITIAL_STATE, [remoteDevMiddleware]);
```

If you don't already have the browser plugin, you can install it from [here](https://github.com/zalmoxisus/redux-devtools-extension).

The plugin records all the actions and changes to the state of your store, and lets you time travel to previous states, toggle actions, and do diffing on the state. This is all connected live to your application, so you can easily see how changes in the state get reflected in the view. You can also dispatch actions from the plugin, and save and restore the state, so you can pass it to somebody else, or include it in a bug report.

We recommend only using the remotedev middleware in your development environment / builds - not for production builds. This is because (a) you probably don't want your users to be able to debug your application, and (b) it adds a fair amount of overhead if the redux-devtools-extension is installed, since it records all changes to the state.