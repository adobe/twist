# Task Queue

A singleton representing Twist's task queue that is bound to `requestAnimationFrame`. This allows Twist to schedule DOM updates in a more efficient manner. You can indicate that methods should run within the task queue by adding the [`@Task`](../decorators/task.md) decorator.