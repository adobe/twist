# @Throttle

The `@Throttle` decorator is used to throttle the application of a method when it's invoked, so that it's only executed at most once in a given time period (which is passed as an argument to the decorator, in milliseconds). This provides the same functionality as the [Lodash Throttle](https://lodash.com/docs/4.17.2#throttle) utility.

Usage:

```jsx
class C {
    @Throttle(wait)
    method() {

    }
}
```

As an example, if `wait` is 1000 (1 second), then the following code will result in `method` being called precisely twice, with a 1 second delay between each call:

```jsx
var c = new C();
c.method();
c.method();
c.method();
```
