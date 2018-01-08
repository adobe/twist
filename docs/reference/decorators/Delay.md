<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [@Delay](#delay)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# @Delay

The `@Delay` decorator is used to delay the application of a method for a given number of milliseconds, after it is invoked. This provides the same functionality as the [Lodash Delay](https://lodash.com/docs/4.17.2#delay) utility.

Usage:

```jsx
class C {
    @Delay(wait)
    myMethod() {

    }
}
```

As an example, if `wait` is 1000 (1 second), then the following code will wait 1 second before executing `myMethod`:

```jsx
var c = new C();
c.myMethod();
```
