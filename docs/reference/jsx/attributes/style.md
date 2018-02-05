<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [JSX Style Attributes](#jsx-style-attributes)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# JSX Style Attributes

Twist extends how JSX and idiomatic React deal with styling elements, making styling elements easier and more productive.

## Extensions to the `style` attribute

React and other frameworks require that the `style` attribute be an object. Twist, however, allows the this attribute to be a string. This only makes sense for static inline styles as this can improve readability, but reduces the ability to directly target changes to specific styles later, unless you use targeted style extensions (explained below).

For example:

```jsx
{/* Typical React */}
<div style={{backgroundColor: "blue", border: "1px solid red"}}>
    Hello
</div>

{/* Twist */}
<div style="background-color: 'blue'; border: 1px solid red">
    Hello
</div>
```

## Targeted style extensions

React's requirement that the `style` attribute be an object can make it unnecessarily difficult to target individual styles. Components may often have several styles that never change, but may have one or two that do. Let's imagine a simple component that has a dynamically changing background.

```jsx
/* React */
const styles = {
    container: {
        borderWidth: 2,
        borderStyle: 'solid',
        padding: 5,
        margin: 5,
        width: 100,
        height: 200
    }
};

const DynamicCard = ({backgroundColor = 'red', borderColor = 'black'} = {}) => (
    <div style={{...styles.container, backgroundColor, borderColor}} />
);

/*
 * if you can't use object spread, then you have to use
 * Object.assign({}, styles.container, { backgroundColor, borderColor })
 */
```

Although this works, it can become difficult to read if a lot of styles are being modified. Let's look at how Twist can help (note that the above is perfectly valid in Twist as well):

```jsx
/* Twist */
const styles = {
    container: {
        borderWidth: 2,
        borderStyle: "solid",
        padding: 5,
        margin: 5,
        width: 100,
        height: 200
    }
};

const DynamicCard = ({backgroundColor = 'red', borderColor = 'black'} = {}) => (
    <div style={styles}
         style-background-color={backgroundColor}
         style-border-color={borderColor} />
);

```

This isn't _shorter_ than the React version, but it _is_ more readable, especially if you need to handle many styles that may be changing dynamically. Here it's obvious which styles are constant, and which styles are dynamic.