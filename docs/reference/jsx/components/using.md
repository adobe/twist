<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [`<using>`](#using)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# `<using>`

The `<using>` structural component is a mechanism for creating variables in JSX. This allows you to create aliases for more complex expressions. It takes two attributes:

* `value` - the expression to evaluate.
* `as` - the variable to assign the expression to. Note that this must be a free identifier - if you try to write an expression, you'll get an error.

Here's a simple example of `<using>`, where we assign the expression `this.name` to the variable `name`:

```jsx
@Component
export default class Component {
    @Observable name;

    render() {
        return <g>
            <label>Name: </label>
            <input type="text" placeholder="Enter your name" bind:value={ this.name }/>
            <using value={ this.name } as={ name }>
                <h2>
                    Hello { name }!
                </h2>
            </using>
        </g>
    }
}
```

Note that if the `value` expression evaluates to a falsy value (`false`, `0`, `null`, `undefined`, `''`, `NaN`), then the contents of the `<using>` tag will not be rendered.

If you need to handle this case, an [`<else>`](./else.md) component can be used after `<using>`, like the following:

```jsx
@Component
export default class Component {
    @Observable name;

    render() {
        return <g>
            <label>Name: </label>
            <input type="text" placeholder="Enter your name" bind:value={ this.name }/>
            <using value={ this.name } as={ name }>
                <h2>
                    Hello { name }!
                </h2>
            </using>
            <else>
                <h2>
                    Please enter your name.
                </h2>
            </else>
        </g>
    }
}
```

The scope of the variable defined with `as` is limited to the contents of the `<using>` - you can't use it elsewhere in the JSX, so you get proper scoping. If you have a nested `<using>` that defines the same variable, then the innermost binding applies, as you'd expect:

```jsx
export default <using value={ 2 } as={ name }>
    <using value={ 3 } as={ name }>
        Inner: { name }
    </using>;
    Outer: { name }
</using>;
```

One important use of `<using>` is to help with dynamically switching components - the only thing to remember is that custom components must start with an upper case letter. Here's an example:

```jsx
@Component
class MyButton {
    render() {
        return <button>Button</button>;
    }
}

@Component
class MyTestButton {
    render() {
        return <button>Test Button</button>;
    }
}

@Component
export default class MyComponent {
    @Attribute isTest = false;

    render() {
        return <g>
            <using value={ this.isTest ? MyTestButton : MyButton } as={ Button }>
                <Button />
            </using>
        </g>;
    }
}
```
