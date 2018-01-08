# Middleware

When you create a store, you can also pass in a _middleware_ argument to the constructor. This is just an array of functions of the form:

```javascript
function (store, action, payload, done) {
    // Here you can intercept the action (e.g. to support async actions), or you can simply log what goes by (e.g. for devtools).
    // To continue to the next action, call the done() callback - otherwise, the action will stop being dispatched.
    // To modify the action, call done(newAction, newPayload) - if you don't provide an argument to done(), it'll continue with the action unchanged.
    // Note that payload is an array of arguments (because actions may take multiple arguments).
}
```

You would change the initialization of the store to:

```javascript
this.scope.store = new MyStore(INITIAL_STATE, [Middleware1, Middleware2]);
```
