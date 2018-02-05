<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [JSX Class Enhancements](#jsx-class-enhancements)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# JSX Class Enhancements

Twist extends JSX in several important ways when it comes to handling CSS classes -- all of which are designed to increase productivity, readability, and maintainability.

## `class` support

Because JSX compiles to JavaScript, React decided that attributes should conform to their DOM API counterparts. This meant using `className` instead of `class` for assigning CSS classes. (`class` also happens to be a reserved word in JavaScript.)

This isn't terribly convenient, and it's error-prone. JSX _looks_ so much like HTML that it's easy to fall back into HTML habits and simply write out `class="foo"`, and then spend several minutes wondering why styles aren't being applied correctly.

Twist, however, allows you to use `class` when specifying class names, as shown in the following example:

```jsx
{/* React */}
<div className="card" />

{/* Twist */}
<div class="card" />
```

Twist adds a a couple of additional feature that makes it easier to work with multiple classes. If you specify multiple `class` attributes, they will all be concatenated together for you. For example:

```jsx
{/* React */}
<div className="card primary cta" />

{/* Twist */}
<div class="card" class="primary" class="cta" />
```

You can also use arrays for `class` in Twist, like so:

```jsx
{/* Twist */}
<div class={["card", "primary", "cta"]} />
```

While this isn't as useful when specifying static styles, it comes in handy when specifying styles that might change. For example:

```jsx
{/* React */}
<div className={`card cta ${primary ? "primary" : ""}`} />

{/* Twist */}
<div class={["card", "cta"]} class={primary ? "primary" : ""} />
```

Twist isn't done yet, though -- the above pattern of assigning classes based on a variable is so common that Twist provides and additional shorthand -- the following example maps exactly to the above example:

```jsx
{/* Twist */}
<div class={["cart", "cta"]} class-primary={primary} />
```