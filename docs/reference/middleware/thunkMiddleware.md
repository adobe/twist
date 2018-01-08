<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Thunk Middleware](#thunk-middleware)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Thunk Middleware

This allows you to have _asynchronous_ actions. The action handlers on a store that you define with `@Action` must be synchronous, but there's nothing stopping you from composing more complex actions that are asynchronous - so long as all the state mutations are described in terms of simple synchronous actions.

To make this easy, the _thunk middleware_ lets you pass in a function as an action. This is enabled by default. Here's an example:

```javascript
var store = new MyStore(INITIAL_STATE);

var DELAYED_SET_USER_TITLE = function (store, payload) {
    setTimeout(() => store.dispatch('SET_USER_TITLE', payload.title), payload.delay);
};

store.dispatch(DELAYED_SET_USER_TITLE, { title: 'Dr.', delay: 1000 });
```

A common use case for asynchronous actions is when fetching data from a REST API. Note that the function you pass in can dispatch as many actions as you like, including other asynchronous actions.

You can also add an asynchronous action to your store, using `@Action({async: true})` - this allows us to write the above as:

```javascript
@Store
class MyStore {

    @State.byRef(User) user;

    @Action SET_USER_TITLE(title) {
        this.user.title = title;
    }

    @Action({async: true}) DELAYED_SET_USER_TITLE(payload) {
        setTimeout(() => this.dispatch('SET_USER_TITLE', payload.title), payload.delay);
    }
}

var store = new MyStore(INITIAL_STATE);
store.dispatch('DELAYED_SET_USER_TITLE', { title: 'Dr.', delay: 1000 });
```

Note that asynchronous actions can in turn dispatch both synchronous and asynchronous actions, but synchronous actions _cannot_ dispatch asynchronous actions (for obvious reasons).

As a consequence, if you mark an action handler as `@Action({async: true})`, then it can _only_ be invoked by dispatching it directly on that store. If you dispatch an action with this name to a parent store, then it will _not_ execute matching asynchronous actions in child stores, as it propagates. This is because only synchronous actions can propagate, and synchronous actions cannot dispatch asynchronous actions.
