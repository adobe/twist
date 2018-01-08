# @Debounce

The `@Debounce` decorator is used to delay the application of a method for a given number of milliseconds, after it is invoked. This provides the same functionality as the [Lodash Debounce](https://lodash.com/docs/4.17.2#debounce) utility.

Usage:

```jsx
class C {
    @Debounce(wait)
    method() {

    }
}
```

As an example, if `wait` is 1000 (1 second), then the following code will result in `method` being called precisely once, with a 1 second delay (all the calls are grouped together):

```jsx
var c = new C();
c.method();
c.method();
c.method();
```
