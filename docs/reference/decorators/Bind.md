<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [@Bind](#bind)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# @Bind

The `@Bind` decorator modifies a method so that the `this` object is bound to it - meaning you can execute the method as a normal function, without needing the object it belongs to. This provides the same functionality as the [Lodash Bind](https://lodash.com/docs/4.17.2#bind) utility.

Usage:

```jsx
class C {
    @Bind
    method() {
    }
}
```

You can now write the following:

```jsx
var c = new C();
setTimeout(c.method, 1000);
```

Without `@Bind`, this would fail if `method` tries to access `this`. It saves you from having to write `setTimeout(c.method.bind(c), 1000)`.
