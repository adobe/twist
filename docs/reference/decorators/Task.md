<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [@Task](#task)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# @Task

The `@Task` decorator tells Twist to execute a method as part of its [task queue](../core/TaskQueue.md). It takes a numerical priority as an argument, which determines the order that tasks are run in (tasks with lower numbers for their priority are run first).

Usage:

```jsx
class C {
    @Task(priority)
    myMethod() {

    }
}
```
