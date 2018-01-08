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
