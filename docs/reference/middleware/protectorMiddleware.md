<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Protector Middlware](#protector-middlware)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Protector Middlware

When you define synchronous actions in Twist, it's really important that they are _actually_ synchronous. A common mistake is to do something asynchronous, like a network call, or setting a timeout. The problem with this, is that it makes the changes to the store in response to an action non-deterministic. If you're using the [DevTools Middleware](#devtools-middleware), this poses a particular problem, because it needs to be able to replay synchronous actions as you move forwards and backwards in time.

To help detect such common mistakes, Twist comes with _protector middleware_ that automatically blocks certain common asynchronous operations from inside of synchronous action handlers - for example, `setTimeout`, `setInterval`, and the use of promises. If you need to do something asynchronous, just make the action asynchronous (`@Action({async: true})`)! Since this has to replace some of the browser globals to achieve this, we recommend only using the protector middleware in your development environment / builds - not for production builds.

To use this middleware, just pass it in when creating your store:

```javascript
import { protectorMiddleware } from '@twist/core';

var store = new MyStore(INITIAL_STATE, [protectorMiddleware]);
```