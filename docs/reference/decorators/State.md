# @State

The `@State` decorators are used to indicate the types for fields inside [stores](./Store.md). This is important when serializing data.

## @State.byVal

Use `@State.byVal` to serialize and store primitive values, like numbers and strings. When serializing, it makes a shallow copy of the value - because of this, you can also use it for simple maps, but it's not advisable for more complex objects.

Example:

```
@Store
class MyClass {
    @State.byVal prop;
}

var obj = { x: 2 };

new MyClass().fromJSON({prop: 2});   // prop === 2
new MyClass().fromJSON({prop: obj}); // prop !== obj
                                     // prop.x === 2
```


## @State.byBooleanVal

Use `@State.byBooleanVal` to store and serialize Boolean values. If the value is not a Boolean, it will be converted into one, using `Boolean(value)` - with the exception that the string `'false'` maps to `false`.

Example:

```
@Store
class MyClass {
    @State.byBooleanVal prop;
}

new MyClass().fromJSON({prop: true});    // prop === true
new MyClass().fromJSON({prop: false});   // prop === false
new MyClass().fromJSON({prop: 'true'});  // prop === true
new MyClass().fromJSON({prop: 'false'}); // prop === false
new MyClass().fromJSON({prop: 42});      // prop === true
new MyClass().fromJSON({prop: 0});       // prop === false
```

## @State.byNumberVal

Use `@State.byNumberVal` to store and serialize numbers. The value will be converted into a number, using `Number(value)`.

Example:

```
@Store
class MyClass {
    @State.byNumberVal prop;
}

new MyClass().fromJSON({prop: 42});   // prop === 42
new MyClass().fromJSON({prop: '42'}); // prop === 42
new MyClass().fromJSON({prop: 'x'});  // prop === NaN
```


## @State.bySimpleVal

Use `@State.bySimpleVal` to serialize and store primitive values - unlike `@State.byVal`, this doesn't make a copy, so you shouldn't use it if you expect the value to be an object.

Example:

```
@Store
class MyClass {
    @State.bySimpleVal prop;
}

var obj = { x: 2 };

new MyClass().fromJSON({prop: 2});   // prop === 2
new MyClass().fromJSON({prop: obj}); // prop === obj
```


## @State.byCustomVal(serializer, defaultValue)

Use `@State.byCustomVal` if you want to control the serialization of the value. You pass in a `serializer` object to the component, which must have a `parse` function (called during `fromJSON`) and a `serialize` function (called during `toJSON`). You can also provide a default value that will get supplied to `parse` if the property is missing from the JSON provided to `fromJSON`.

Example:

```
var serializer = {
    parse: (jsonValue, object, propertyName) => {
        return jsonValue === 'debug' ? 'test' : jsonValue;
    },
    serialize: (value, object, propertyName) => {
        // value === object[propertyName]
        return value === 'test' ? 'debug' : value;
    }
};

@Store
class MyClass {
    @State.byCustomVal(serializer, 'default') prop;
}

new MyClass().fromJSON({prop: 'value'}); // prop === 'value'
new MyClass().fromJSON({prop: 'debug'}); // prop === 'test'
new MyClass().fromJSON({});              // prop === 'default'
```

Note that while you can supply any methods you like, you ought to make sure that `parse(serialize(parse(x)))` is equal to `parse(x)`, and that `serialize(parse(serialize(y)))` is equal to `serialize(y)`.


## @State.byRef(type)

Use `@State.byRef` to store and deserialize a nested store. This allows you to build a much richer exportable structure. `@State.byRef` takes the class of the property as its argument, and always ensures that an instance of the class is created, even if the value is missing from the JSON provided to `fromJSON`.

Example:

```
@Store
class MyNestedClass {
    @State.byVal x;
}

@Store
class MyClass {
    @State.byRef(MyNestedClass) prop;
}

new MyClass().fromJSON({prop: {x: 2}}); // prop instanceof MyNestedClass
                                        // prop.x === 2
new MyClass().fromJSON({});             // prop instanceof MyNestedClass
                                        // prop.x === undefined
```


## @State.byOptionalRef(type)

`@State.byOptionRef` does the same thing as `@State.byRef`, except that it won't create an instance of the class if the value is missing from the JSON provided to `fromJSON`.

Example:

```
@Store
class MyNestedClass {
    @State.byVal x;
}

@Store
class MyClass {
    @State.byOptionalRef(MyNestedClass) prop;
}

new MyClass().fromJSON({prop: {x: 2}}); // prop instanceof MyNestedClass
                                        // prop.x === 2
new MyClass().fromJSON({});             // prop === null
```


## @State.byCustomRef(getType)

Use `@State.byCustomRef` when you want to dynamically choose the type of the class to use for the property. Instead of providing a class as an argument, you provide a function that takes the JSON value as input - this lets you decide what class to use at the time `fromJSON` is called.

Example:

```
@Store
class MyNestedClass {
    @State.byVal x;
}
@Store
class MyNestedClassDebug {
    @State.byVal x;
}

var getClass = function(jsonValue, object) {
    return jsonValue.isDebug ? MyNestedClassDebug : MyNestedClass;
};

@Store
class MyClass {
    @State.byCustomRef(getClass) prop;
}

new MyClass().fromJSON({prop: {x: 2}});                // prop instanceof MyNestedClass
                                                       // prop.x === 2
new MyClass().fromJSON({prop: {x: 2, isDebug: true}}); // prop instanceof MyNestedClassDebug
                                                       // prop.x === 2
```

If you need to use the same class, but instantiated in different ways (i.e. passing different options to the constructor), you can also return an instance of the Exportable class from `getClass` - in this case, the instance you provide will be used. For example:

```
var getClass = function(jsonValue, object) {
    return jsonValue.isDebug ? new MyNestedClass({debug: true}) : new MyNestedClass();
};
```


## @State.byArray(isStatic)

Use `@State.byArray` to deserialize JSON into an [`ObservableArray`](../core/ObservableArray), where each item in the array is a primitive value (e.g. if you have an array of strings or numbers). If each item in the array is a more complex object, consider using `@State.byRefArray` instead. This lets you bind to the contents of the array from a view - for example, iterating over the array in the `render` function of a component.

Example:

```
@Store
class MyClass {
    @State.byArray prop;
}

var array = [ 2, 3 ];

new MyClass().fromJSON({prop: array}); // prop instanceof ObservableArray
                                       // prop.at(0) === 2
                                       // prop.at(1) === 3
new MyClass().fromJSON({prop: 42});    // prop instanceof ObservableArray
                                       // prop.length === 0
```

If you want the property to become a normal array rather than an `ObservableArray`, pass in `true` as the second parameter (`isStatic`).

Example:

```
@Store
class MyClass {
    @State.byArray(true) prop;
}

var array = [ 2, 3 ];

new MyClass().fromJSON({prop: array}); // prop instanceof Array
                                       // prop[0] === 2
                                       // prop[1] === 3
new MyClass().fromJSON({});            // prop instanceof Array
                                       // prop.length === 0
```


## @State.byRefArray(type, isStatic)

Use `@State.byRefArray` to deserialize JSON into an [`ObservableArray`](../core/ObservableArray), where each item in the array is an instance of the class you pass in as a parameter. This is in contrast to `@State.byArray`, where the items in the array are primitive types. This lets you bind to the contents of the array from a view - for example, iterating over the array in the `render` function of a component.

Example:

```
@Store
class MyNestedClass {
    @State.byVal x;
}

@Store
class MyClass {
    @State.byRefArray(MyNestedClass) prop;
}

new MyClass().fromJSON({prop: [{x: 2}]}); // prop instanceof ObservableArray
                                          // prop.at(0) instanceof MyNestedClass
                                          // prop.at(0).x === 2
new MyClass().fromJSON({});               // prop instanceof ObservableArray
                                          // prop.length === 0
```

If you don't want the property to become an `ObservableArray`, but you still want each item in the array to be deserialized into an `Exportable` object, then pass in `true` as the second parameter (`isStatic`).

Example:

```
@Store
class MyNestedClass {
    @State.byVal x;
}

@Store
class MyClass {
    @State.byRefArray(MyNestedClass, true) prop;
}

new MyClass().fromJSON({prop: [{x: 2}]}); // prop instanceof Array
                                          // prop[0] instanceof MyNestedClass
                                          // prop[0].x === 2
new MyClass().fromJSON({});               // prop instanceof Array
                                          // prop.length === 0
```


## @State.byCustomRefArray(getType, isStatic)

`@State.byCustomRefArray` is the same as `@State.byRefArray`, except that you can choose the type of each element in the array dynamically. Just like `@State.byCustomRef`, you pass in a function that takes the JSON value as input - this lets you decide what class to use at the time `fromJSON` is called.

Example:

```
@Store
class MyNestedClass {
    @State.byVal x;
}
@Store
class MyNestedClassDebug {
    @State.byVal x;
}

var getClass = function(jsonValue, object) {
    return jsonValue.isDebug ? MyNestedClassDebug : MyNestedClass;
};

@Store
class MyClass {
    @State.byCustomRefArray(getClass) prop;
}

new MyClass().fromJSON({prop: [{x: 2}]});                // prop instanceof ObservableArray
                                                         // prop.at(0) instanceof MyNestedClass
                                                         // prop.at(0).x === 2
new MyClass().fromJSON({prop: [{x: 2, isDebug: true}]}); // prop instanceof MyNestedClassDebug
                                                         // prop.at(0).x === 2
```

The `isStatic` parameter works the same way as for `@State.byRefArray`.


## @State.byMap(isStatic)

Use `@State.byMap` to deserialize JSON into an [`ObservableMap`](../core/ObservableMap), where the value of each key is a primitive value (e.g. if you have a map onto strings or numbers). If each item in the array is a more complex object, consider using `@State.byRefArray` instead. This lets you bind to the contents of the array from a view - for example, iterating over the array in the `render` function of a component.

Example:

```
@Store
class MyClass {
    @State.byMap prop;
}

var map = { x: 2, y: 3 };

new MyClass().fromJSON({prop: map}); // prop instanceof ObservableMap
                                     // prop.get('x') === 2
                                     // prop.get('y') === 3
new MyClass().fromJSON({prop: 42});  // prop instanceof ObservableMap
                                     // prop.size === 0
```

If you want the property to become a normal object rather than an `ObservableMap`, pass in `true` as the second parameter (`isStatic`).

Example:

```
@Store
class MyClass {
    @State.byMap(true) prop;
}

var map = { x: 2, y: 3 };

new MyClass().fromJSON({prop: map}); // prop instanceof Object
                                     // prop.x === 2
                                     // prop.y === 3
new MyClass().fromJSON({prop: 42});  // prop instanceof Object
                                     // Object.keys(prop).length === 0
```


## @State.byRefMap(type, isStatic)

Use `@State.byRefMap` to deserialize JSON into an [`ObservableMap`](../core/ObservableMap), where the value of each key is an instance of the class you pass in as a parameter. This is in contrast to `@State.byMap`, where the values are primitive types. This allows you to bind to the contents of the map from a view, so that the view updates when the key/value mapping can changes.

Example:

```
@Store
class MyNestedClass {
    @State.byVal x;
}

@Store
class MyClass {
    @State.byRefMap(MyNestedClass) prop;
}

new MyClass().fromJSON({prop: {field: {x: 2}}}); // prop instanceof ObservableMap
                                                 // prop.get('field') instanceof MyNestedClass
                                                 // prop.get('field').x === 2
new MyClass().fromJSON({});                      // prop instanceof ObservableMap
                                                 // prop.size === 0
```

If you don't want the property to become an `ObservableMap`, but you still want each value in the map to be deserialized into an `Exportable` object, then pass in `true` as the second parameter (`isStatic`).

Example:

```
@Store
class MyNestedClass {
    @State.byVal x;
}

@Store
class MyClass {
    @State.byRefMap(MyNestedClass, true) prop;
}

new MyClass().fromJSON({prop: {field: {x: 2}}}); // prop instanceof Object
                                                 // prop.field instanceof MyNestedClass
                                                 // prop.field.x === 2
new MyClass().fromJSON({});                      // prop instanceof Object
                                                 // Object.keys(prop).length === 0
```


## @State.alias(jsonName)

Use `@State.alias` in conjunction with any other `@State.XXX` decorator, to use a different name for the property in JSON compared to the name of the property in the store. `@State.alias` takes the name to use when serializing to JSON as a parameter.

Example:

```
@Store
class MyClass {
    @State.alias('jsonProp') @State.byVal prop;
}

new MyClass().fromJSON({prop: 2});     // prop === undefined
new MyClass().fromJSON({jsonProp: 2}); // prop === 2
```
