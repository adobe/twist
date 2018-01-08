<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [@Prototype](#prototype)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# @Prototype

The `@Prototype` decorator lets you attach properties and methods to the [prototype](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/prototype) of a class. The decorator takes an object as an argument, and attaches

Usage:

```jsx
@Prototype(obj)
class C {
}
```

Note that for most cases, you shouldn't need to use `@Protoype` - you can simply define a property on the class and give it a default value. There's a difference though, and sometimes it matters. Consider the following two examples:

```jsx
class A {
    name = 'default-name';
}

@Prototype({name: 'default-name'})
class B {
}
```

When you create multiple instances of `A`, each instance will have a property called `name` with a copy of the value (`'default-name'`). On the other hand, when you create multiple instance of `B`, they _share_ the prototype, so there's only one copy of `name: 'default-name'`.

The other subtle difference is if you delete the `name` property:

```jsx
var a = new A();
delete a.name;
console.log(a.name);
// Prints "undefined"

var b = new B();
delete b.name;
console.log(b.name);
// Prints "default-name"
```

In the second case, since `name` is stored on the prototype, deleting it from an instance has the effect of restoring the default value, rather than setting it to undefined. Sometimes this is what you want, whereas sometimes you want the former.
