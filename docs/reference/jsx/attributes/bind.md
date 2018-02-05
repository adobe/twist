# Two-way Data Binding

One can indicate that a JSX property should use two-way data binding by using the `bind:` prefix on a property. This is most useful on form elements.

For example,

```jsx
<input type="text" bind:value={this.name} />
```
