# Declarative JSX Extensions

Twist adds several components to JSX to further improve productivity and readability. For example, if you need to iterate over an array, you would typically use `Array#map` in JavaScript, but Twist adds the `<repeat>` tag. This can often be easier to read and maintain. Another typical pattern is needing to display some information based on a conditional -- in JSX one might use a ternary operator (`?:`) or `&&`, which isn't always the easiest to read. Twist provides the `<if>`, `<else>`, `<elseif>`, and `<unless>` tags that make conditional display easy.

## Conditional Rendering

* [`<if>`](./if.md)
* [`<elseif>`](./elseif.md)
* [`<else>`](./else.md)
* [`<unless>`](./unless.md)

## Iteration

* [`<repeat>`](./repeat.md)

## Other

* [`<using>`](./using.md)
* [`<g>`](./g.md)
