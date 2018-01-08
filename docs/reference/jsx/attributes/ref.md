# `ref`

The `ref` attribute is used to access the underlying DOM element of a primitive component, or the instance of a custom component. It assigns this to the variable or expression that you pass in - for example, `ref={ this.element }` will bind the DOM element or component instance to the `this.element`.

Here's an example, accessing a DOM element - notice that you have access to all the HTML/SVG [Element APIs](https://developer.mozilla.org/en-US/docs/Web/API/Element):

```jsx
@Component
export default class Sample {

    @Observable element;

    getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    @Bind
    changeColor(){
        this.element.style.color = this.getRandomColor();
    }

    render() {
        return <g>
            <h2 ref={ this.element }>Name Attribute Example</h2>
            <div>
                <input type="button" value="Change color of text" onClick={ this.changeColor }/>
            </div>
        </g>
    }
}
```

> **NOTE**: The `ref` attribute is reserved (it has special semantics), meaning that you shouldn't use it as an attribute name for a custom component - if you do, reactivity won't work as expected.


## Usage Subtleties

If you use `ref` to bind to a property on your component that doesn't exist, it will create it for you automatically, as though you had explicitly declared it as `@Observable`:

```jsx
@Component
export default class Sample {
    render() {
        return <div>
            <h2 ref={ this.newProperty }>Name Attribute Example</h2>
            <p>The component now has a new observable property referencing the <b>{ this.newProperty.tagName }</b> element</p>
        </div>
    }
}