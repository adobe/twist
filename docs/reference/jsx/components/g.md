<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [`<g>`](#g)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# `<g>`

The `<g>` structural component is used to group multiple components together, to work around the restriction that a JSX expression can only evaluate to a single component. Since it's a virtual component, it doesn't correspond to anything in the DOM.

> **NOTE**: This will soon be changed `<>` to match React 16.2's JSX syntax.

Here's an example that uses the `<g>` tag to insert multiple items into a list at once:

```jsx
import { ObservableArray } from '@twist/core';

@Component
class Employee {
    @Attribute name;
    @Attribute bossName;

    render() {
        return <g>
            <li>{this.name}</li>
            <li>{this.bossName}</li>
        </g>;
    }
}

@Component
export default class MyComponent {

    employees = new ObservableArray([
        {name: 'Alice', bossName: 'Bob'},
        {name: 'Eve', bossName: 'NSA'}
    ]);

    render() {
        return <repeat collection={ this.employees } as={ employee }>
            <Employee name={ employee.name } bossName={ employee.bossName } />
        </repeat>;
    }
}
```

This avoids the need to wrap components in extra `<div>`s, so it keeps the DOM cleaner.

> **NOTE**: One thing to remember is that if you use `<g>` inside an `<svg>`tag, it's always interpreted as the SVG group element.
