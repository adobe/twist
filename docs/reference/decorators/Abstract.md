<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [@Abstract](#abstract)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# @Abstract

The `@Abstract` decorator lets you mark a method as abstract - this is a way of forcing anybody who extends your class to implement the method. If a subclass doesn't implement it, and you try to invoke it on an instance of the subclass, it will throw an error rather than calling the superclass method.

Usage:

```jsx
class C {
    @Abstract
    method() {
    }
}
```

In the example below, attempting to call `implementation()` on an instance of `AbstractBaseClass` will result in a JavaScript exception.

```jsx
@Component
class AbstractBaseClass {
    @Abstract
    implementation() {}

    render() {
        return this.implementation();
    }
}

class DerivedClass extends AbstractBaseClass {
    implementation() {
        return <b>I am a DerivedClass</b>;
    }
}

export default DerivedClass;
```
