# @Attribute

The `@Attribute` decorator allows Twist to observe a property of a component, _and_ exposes it to a user of the component. Essentially, the attributes of a component define its interface. This is in contrast to [@Observable](../decorators/observable), which is used for private state.

Like `@Observable`, under the hood, this sets up a getter and setter for the property, so that Twist knows which expressions depend on it, and when it changes. 

Usage:

```jsx
import PropTypes from 'prop-types';

@Component
class MyComponent {
    @Attribute property;
    @Attribute propertyWithDefault = 2;
    @Attribute(PropTypes.number) numberProperty = 4;
}
```

Unlike `@Observable`, `@Attribute` _only_ makes sense for instance properties of a component. For example, you can use the above component as follows:

```jsx
<MyComponent property={ this.value } />
```

If `property` were not instrumented with `@Attribute`, a user of `MyComponent` wouldn't be able to bind to it in this way.
