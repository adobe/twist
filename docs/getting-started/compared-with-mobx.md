# Compared with Mobx

Twist and Mobx initially look somewhat similar due to similar nomenclature. For example, both have the concept of "observables", and even use the same decorator (`@observable`). There are, however, many important differences between the two libraries that make a direction 1:1 translation difficult.

> NOTE: Mobx itself is framework agnostic. In this comparison, the assumption is that one is using mobx in conjunction with React. This uses the `mobx-react` library in addition to `mobx`. Likewise, Twist itself is framework agnostic – this document assumes one is using the React Twist bindings.

## State Container

Mobx is fairly explicit about _not being a state container_. It just provides the wiring for observables and observers, with some mechanisms for injecting stores. As such, you're free to build your stores however you like. If you want something more opinionated that can serialize, time travel, etc., then `mobx-state-tree` is worth checking out. 

## Explicit Imports

Unlike Twist, explicit imports are favored over injected imports:

```js
import { observable, computed, action } from 'mobx';
import { observer, inject } from 'mobx-react';
```

## Decorators

Mobx advocates for the use of decorators, since they can reduce boilerplate and are easier to read, but Mobx _does_ document how to avoid using decorators. Twist uses decorators as well, but doesn't currently document how to avoid using them.

```js
/* mobx */
export default class ColorStore {
    @observable hue = 100;
    /* ... */
    
    @computed
    get color() {
        return `hsl(${this.hue}, ${this.sat}%, ${this.lum}%)`;
    }
    
    @action
    setColor(color) {
        this.color.hue = color.hue;
        /* ... */
    }
}

/* twist */
@Store
export default class ColorStore {
    @Observable hue = 100;
    /* ... */
    
    get color() {
        return `hsl(${this.hue}, ${this.sat}%, ${this.lum}%)`;
    }

    @Action
    SET_COLOR(color) {
        this.color.hue = color.hue;
        /* ... */
    }
}
```

## Observables

Observables in Mobx are very similar to those in Twist. One key difference is with observable arrays, however. In both cases, arrays are transformed into something else, but where Twist wraps the array with `ObservableArray`, Mobx _converts_ the array to an object (with the expected methods, like `map`). This has the benefit of letting us continue to use brackets to index the array (because we can use brackets on objects), but it has the downside that the observable array is most definitely _not_ a real array, and some degree of work has to go into making it act like one.

```js
/* Mobx */
@observable name = "Alex";
const anArray = observable([1, 2, 3]);
anArray[0] = 4; // this works in Mobx

/* Twist */
@Observable name = "Alex";
const anArray = ObservableArray([1, 2, 3]);
anArray.setAt(0, 4); // Twist equivalent
```

## Explicit Observation

In Twist one only needs to instrument what is observable. Twist then takes care of invalidating bindings and updating dependencies as needed. In Mobx, one must instrument what is doing the observing as well by indicating that a component is going to be observing something (the `something` itself doesn't matter).

There are multiple ways of defining something as an observer:

* React stateful components can be marked as an observer by using the `@observer` decorator.
* React functional (stateless) components can be marked as an observer by using the `observer` function.
* Parts of the render tree can be marked as observers by using the `<Observer>` component.

One is encouraged to observe as much as makes sense. If one doesn't, an expensive `render` method will create a poor user experience.

> NOTE: Observations are tracked only within the `render` method. This is does not extend to callbacks or children's `render` methods (unless they are also tagged as observers).

```jsx
@observer
export default class PictureEditor extends Component {
    /* ... */
}

export default observer(function Picture(props) { /* ... */ });

render() {
    return (
        <div>
            { /* ... */ }
            <Observer>{
                () => {
                    <input value={ this.observedValue } />
                }
            }</Observer>
            { /* ... */ }
        </div>
    );
}
```

## Stores are Injected

Stores can be provided to children using the `<Provider>` component. Children receive their stores via injection (`(@)inject`) and can reference the store using `props`.

In Twist, stores are often provided via [`scope`](../fundamentals/state-management.md).

```js
@inject("pictureStore")
@observer
export default class PictureEditor extends Component {
    /* ... */
}
```

## Stores are not typed

As mentioned above, Mobx has no opinions regarding state containers. As such, serialization is not provided by default. You can still do it, but you have to reconstruct the correct types yourself.

With Twist, the contents of stores are typed and can be automatically serialized.

# + mobx-state-tree

[mobx-state-tree](https://github.com/mobxjs/mobx-state-tree) adds in capabilities that we typically associate with Twist, including:

* Serialization
* Time travel
* Middleware (including connecting to Redux Dev Tools)

## Explicit Import

mobx-state-tree expects that you'll import it explicitly.

```js
import { types } from 'mobx-state-tree';
```

## Models are typed

Because models in mobx-state-tree support serialization, they are typed. Types include the expected primitives as well as arrays and maps. Fields can be indicated as optional, and can also provide defaults. This is similar to Twist.

## Defining Models

Models are defined using the `types.model` method and _not_ by creating a `class`.

```js
/* mobx-state-tree */
export default types.model( "ColorStore", {
    hue: types.optional(types.number, 0), /* ... */
});

/* Twist */
@Store
export default class ColorStore {
    @State.byNumberVal hue = 0;
}
```

Computed properties (called "views") are added using a chained method (`view`). Note the use of `self` instead of `this` in the following example:

```js
/* mobx-state-tree */
export default types.model( "ColorStore", {
    hue: types.optional(types.number, 0), /* ... */
}).views(self => {
    return {
        get color() {
            return `hsl(${self.hue}, ...)`;
        }
    };
});

/* Twist */
@Store
export default class ColorStore {
    @State.byNumberVal hue = 0;

    get color() {
        return `hsl${this.hue}, ...)`;
    }
}
```

Models are mutable, but only within the context of an `action`. Otherwise attempting to change a property directly will throw an error. The same is true with Twist, unless the store is explicitly set to be mutable (in which case implicit actions are created underneath the hood).

```js
/* mobx-state-tree */
export default types.model( "ColorStore", {
    hue: types.optional(types.number, 0), /* ... */
}).views(self => {
    return { /* ... */ };
}).actions(self => {
    return {
        setColor(color) {
            this.color.hue = color.hue;
        }
    };
});

/* Twist */
@Store
export default class ColorStore {
    /* ... */

    @Action
    SET_COLOR(color) {
        this.color.hue = color.hue;
    }
}
```

## Dispatching Actions

Actions are called like methods on the model. When connecting to Redux Dev Tools, the action name is used automatically.

Twist uses the `dispatch` method on the store to call an action.

```js
/* mobx-state-tree */
color.setColor({hue: 50}); // equivalent to dispatch('setColor', ...);

/* Twist */
color.dispatch("SET_COLOR", {hue: 50});
```

## Serialization

Serialization is as easy with mobx-state-tree as it is with Twist. One requests a vanilla JS object, which can then be serialized using `JSON.stringify`. Deserialization works similarly -- a string is converted using `JSON.parse` and the store is reconstructed from the result.

```js
/* mobx-state-tree */
import { getSnapshot, applySnapshot } from 'mobx-state-tree';
/* ... */
save() {
    const json = JSON.stringify(getSnapshot(this.props.pictureStore), null, 2);
    this.props.storage.setItem('picture', json);
}

load() {
    const json = this.props.storage.getItem('picture');
    if (json) {
        try {
            const data = JSON.parse(json);
            applySnapshot(this.props.pictureStore, data);
        } catch (err) {
            throw new Error('Could not parse JSON');
        }
    }
}

/* Twist */
// TODO
```

## Middleware

Various middlwares are provided, including ones that faciliate time travel and undo. A utility method is also provided to enable the use or Redux Devtools:

```js
/* mobx-state-tree */
import { connectReduxDevtools } from 'mst-middlewares';
/* ... */
connectReduxDevtools(require("remotedev"), pictureStore);

/* Twist */
import { remoteDevMiddleware } from '@twist/core';

const store = new PictureStore(INITIAL_STATE, [remoteDevMiddleware]);
```

Redux Devtools works as expected in the above configuration.
