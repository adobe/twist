<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [`<elseif>`](#elseif)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# `<elseif>`

The `<elseif>` structural component allows you to create a sequence of conditional statements, rather than nesting multiple `<if>` and `<else>` conditionals:

```jsx
export default <using value={ 'blue' } as={ color }>
    My favorite color is:
    <if condition={ color === 'blue' }>
        the color of the sky
    </if>
    <elseif condition={ color === 'green' }>
        the color of grass
    </elseif>
    <else>
        another color
    </else>
</using>;
```

The `<elseif>` component must always follow  [`<if>`](./if.md) or another `<elseif>`.
