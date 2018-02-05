# Binder

Used to track, invalidate, and update bindings to facilitate reactive rendering.

## Static Public Members

### public static active: *

### public static mutator: * 

### public static mutatorsStack: * 

## Static Public Methods

### public static popMutator(mutator: *) 

### public static pushMutator(mutator: *) 

### public static recordChange(obj: *, propertyName: *, newValue: *, oldValue: *) 

### public static recordEvent(obj: *, eventName: *) 

### public static run(bindings: *, fn: *, context: *): * 

## Public Constructors

### public constructor() 

## Public Members

### public bindings: *[] 

### public callback: * 

### public dirty: * 

### public disposableParent: * 

### public invalidate: * 

### public previousValue: * 

### public set: * 

### public valueGetter: * 

## Public Methods

### public apply(): * 

### public compute(): * 

### public dispose() 

### public get(): * 

### public removeBindings() 

### public update(value: *, invokeCallback: boolean): boolean
