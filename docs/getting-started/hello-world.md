<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Hello, World!](#hello-world)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Hello, World!

When learning any new library, it's often helpful to see some actual code. So, with that in mind, let's build a very simple application using Twist!

> **NOTE**: In this example, we'll be using an abstract component class. When you write your code, you'll be using a component class that's tied to a specific framework, like React.

```js
@Store
export default class UserStore {
    @State.byRef username;
    @State.byRef fullname;
}
```

```js
/// Hello.jsx
@Component
export default class Hello {
    @Attribute name;

    render() {
        return <div>Hello, {this.name}</div>;
    }
}

/// index.jsx
import Hello from "./Hello";

@Component({ fork: true })
class App {
    render() {
        return (
            <div>
                <div>Our first Twist app</div>
                <Hello name="Twist" />
            </div>
        );
    }
}

mount(App);
```
