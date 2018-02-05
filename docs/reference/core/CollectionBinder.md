# CollectionBinder

Used to work with bindings on collections.

## Public Members

### public lengthChanged: boolean 

Indicates if the length of the collection has changed.

### public previousValue: * 

Previous value of the binding.

## Public Methods

### public invokeCallback(value: *) 

Invoke callbacks.

### public onLengthChanged() 

Whenever the length changes, we invalidate the binding.

### public update(value: *, invokeCallback: boolean): boolean 

Check if there are any updates on this collection, and if so, invalidate the binding.