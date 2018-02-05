# Signal

Represents signals that can listened to and triggered.

## Static Public Methods

### public static listenTo(thisObj: *, obj: *, name: *, method: *) 

Registers `method` as a listener for the signal named `name` on `obj`. When triggered, `method` receives `thisObj`, `obj`, `name`, and `method` as arguments.

### public static off(obj: *, name: *, handler: *) 

Removes `handler` from the list of handlers called when the signal named `name` on `obj` is triggered.

### public static on(obj: *, name: *, handler: *): * 

Adds `handler` to the list of handlers called when the signal named `name` on `obj` is triggered.

### public static stopListening(thisObj: *, obj: *, name: *, method: *) 

Removes `method` as a listener for the signal named `name` on `obj`.

### public static trigger(obj: *, name: *, ...args): * 

Trigger the signal named `name` on `obj`, calling any handlers that have been registered, passing `args` as arguments to each handler.

### public static triggerNoArgs(obj: *, name: *): * 

Trigger the signal named `name` on `obj`, calling any handlers that have been registered.

## Public Constructors

### public constructor() 

Creates an instance of `Signal`.

## Public Members

### public handlers: *[] 

The handlers that will be called whenever this signal is triggered.

## Public Methods

### public add(handler: *) 

Adds a handler.

### public remove(handler: *) 

Removes the specified handler.

### public trigger(...) 

Triggers the signal, passing arguments to each handler.

### public triggerNoArgs() 

Triggers the signal, not passing any arguments to each handler.

### public triggerWithArray(args: *) 

Triggers the signal, passing `args` as arguments to each handler.
