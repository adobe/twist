/*
 *  Copyright 2017 Adobe Systems Incorporated. All rights reserved.
 *  This file is licensed to you under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License. You may obtain a copy
 *  of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software distributed under
 *  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 *  OF ANY KIND, either express or implied. See the License for the specific language
 *  governing permissions and limitations under the License.
 *
 */

/**
 * These utilities make it easier to create decorators that can be invoked with *or* without parenthesis.
 *
 * Our old decorator plugins automatically bound a member-expression decorator, even if it was not invoked as a
 * function, e.g. `@fooInstance.bar` would invoke the `bar` function bound to `fooInstance`. The legacy plugin does not
 * do this (the expression is called as-is, so `@fooInstance.bar()` with parens _would_ be bound). The
 * `DecoratorUtils.wrapPropertyDecorator` method addresses this inconsistency by binding their methods to the instance,
 * giving functions a similar signature to the other methods wrapped with the other wrappers
 * (`DecoratorUtils.makePropertyDecorator`).
 */
export default class DecoratorUtils {

    /**
     * With the legacy decorators proposal, we only get one argument (a function), making it ambiguous whether or not
     * this is a decorator that has been called _as a function_ with a function/type as the argument, or as a class
     * decorator. (Example: `@Dec(User)` would be an ambiguous class decorator). It seems the modern standards-track
     * decorators proposal might avoid this issue. For now, we must guess.
     */
    static _isDirectClassInvocation(args) {
        return args.length === 1 && typeof args[0] === 'function';
    }

    static _isDirectPropertyInvocation(args) {
        return args.length === 3 && args[2] && args[2].hasOwnProperty('configurable');
    }

    /**
     * A decorator which wraps other decorators to allow them to be invoked with optional arguments. The decorator
     * should have the same signature as described in `makePropertyDecorator`.
     *
     * Note: Our old decorator plugins automatically bound a member-expression decorator, even if it was not invoked
     * as a function; e.g. `@fooInstance.bar` would invoke the `bar` function bound to `fooInstance`. The legacy plugin
     * does not do this (the expression is called as-is, so `@fooInstance.bar()` with parens would be bound). This
     * wrapper binds methods to the instance, giving functions a similar signature to the other methods wrapped with the
     * other wrappers.
     */
    static wrapPropertyDecorator(target, property, descriptor) {
        const fn = DecoratorUtils.getInitialValue(descriptor);
        delete descriptor.value;
        delete descriptor.writable;
        descriptor.get = function() {
            if (target === this) {
                return fn; // If it's accessed via `prototype` the first time, we don't want to bind to the prototype.
            }
            // Next time just return the bound value directly.
            const bound = DecoratorUtils.makePropertyDecorator(fn.bind(this));
            Object.defineProperty(this, property, { configurable: true, enumerable: false, value: bound });
            return bound;
        };
        return descriptor;
    }

    /**
     * Make a property/method decorator that can be invoked with or without parenthesis, accepting optional arguments.
     * The decorator should have the following signature:
     *
     *     (target: Object, property: string, descriptor: Descriptor, ...args): Descriptor
     *
     * This is identical to the transform-decorators-legacy interface, with the addition of `args`. If a Descriptor
     * is returned, that will be used as the property's descriptor, otherwise the `descriptor` argument will be used.
     *
     * @param {PropertyDecoratorFunction} decorator
     * @param {object?} options
     * @param {string?} options.throwOnClassInvocation
     *   If specified, throw an error with this message if it looks like the user tried to call this property decorator
     *   as a function. By default, we ignore that situation, because it can be ambiguous.
     */
    static makePropertyDecorator(decorator, options = {}) {
        return function(...args) {
            // We can only guess if this was invoked as a factory using duck typing. Sad!
            // Luckily, descriptors must have a `configurable` property, so we're likely to guess right.
            // See <https://github.com/wycats/javascript-decorators/issues/23> for API complaints.
            if (DecoratorUtils._isDirectPropertyInvocation(args)) {
                return decorator.apply(this, args);
            }
            // We don't check this by default, because some property decorators (`State.byRef()`) accept a function.
            // See the class/function ambiguity comments above.
            else if (options.throwOnClassInvocation && DecoratorUtils._isDirectClassInvocation(args)) {
                throw new Error(options.throwOnClassInvocation);
            }
            else {
                // This was a factory, we'll return the actual decorator.
                return function(...invocationArgs) {
                    return decorator.apply(this, invocationArgs.concat(args));
                };
            }
        };
    }

    /**
     * Make a class decorator that can be invoked with or without parenthesis, accepting optional arguments.
     * The decorator should have the following signature:
     *
     *     (target: Object, ...args): Void
     *
     * This is identical to the transform-decorators-legacy interface, with the addition of `args`.
     */
    static makeClassDecorator(decorator) {
        return function(...args) {
            if (DecoratorUtils._isDirectClassInvocation(args)) {
                return decorator.apply(this, args);
            }
            else {
                // This was a factory, we'll return the actual decorator.
                return function(...invocationArgs) {
                    // XXX these are args we must pass to the decorator!
                    return decorator.apply(this, invocationArgs.concat(args));
                };
            }
        };
    }

    /**
     * Return the initial value of the given descriptor.
     */
    static getInitialValue(descriptor) {
        return descriptor.initializer ? descriptor.initializer() : descriptor.value;
    }
}
