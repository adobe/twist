# Scope

Scope is used as a way to pass information to children without having to explicitly pass information via properties or some other method. It's somewhat similar to React's `context`, but has a simpler interface, and allows scoping such that children can't affect data outside their scope if desired.

For more, see [State Management](../../fundamentals/state-management.md).

## Public Methods

### public clean() 

Deletes all public fields on the instance.

### public fork(): * 

Creates a new fork of the scope; changes will not be reflected to the parent scope.