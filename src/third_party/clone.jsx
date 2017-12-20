/*
 *  Copyright 2011 Adobe Systems Incorporated. All rights reserved.
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

// NOTE: This module, originally from <https://www.npmjs.com/package/clone>,
// has been modified from its original version in the following ways:
//
//   - Removed shims for Map, Set, and Promise (we always use native versions)
//   - Removed the `prototype` and `includeNonEnumerable` options
//   - Replaced NodeJS Buffer support with TypedArray support

function isTypedArrayOrArrayBuffer(obj) {
    return (obj instanceof ArrayBuffer || obj instanceof Int8Array || obj instanceof Uint8Array
         || (typeof Uint8ClampedArray !== 'undefined' && obj instanceof Uint8ClampedArray) /* for early IE11 */
         || obj instanceof Int16Array || obj instanceof Uint16Array
         || obj instanceof Int32Array || obj instanceof Uint32Array || obj instanceof Float32Array
         || obj instanceof Float64Array);
}

/**
 * Clones (copies) an Object using deep copying.
 *
 * This function supports circular references by default, but if you are certain
 * there are no circular references in your object, you can save some CPU time
 * by calling clone(obj, false).
 *
 * @param `parent` - the object to be cloned
 * @param `circular` - set to true if the object to be cloned may contain
 *    circular references. (optional - true by default)
 * @param `depth` - set to a number if the object is only to be cloned to
 *    a particular depth. (optional - defaults to Infinity)
*/
function clone(parent, circular, depth) {
    if (typeof circular === 'object') {
        depth = circular.depth;
        circular = circular.circular;
    }
    // maintain two arrays for circular references, where corresponding parents
    // and children have the same index
    var allParents = [];
    var allChildren = [];

    if (typeof circular === 'undefined') {
        circular = true;
    }

    if (typeof depth === 'undefined') {
        depth = Infinity;
    }

    // recurse this function so we don't reset allParents and allChildren
    function _clone(parent, depth) {
        // cloning null always returns null
        if (parent === null) {
            return null;
        }

        if (depth === 0) {
            return parent;
        }

        var child;
        var proto;
        if (typeof parent !== 'object') {
            return parent;
        }

        if (parent instanceof Map) {
            child = new Map();
        }
        else if (parent instanceof Set) {
            child = new Set();
        }
        else if (parent instanceof Promise) {
            child = new Promise(function(resolve, reject) {
                parent.then(function(value) {
                    resolve(_clone(value, depth - 1));
                }, function(err) {
                    reject(_clone(err, depth - 1));
                });
            });
        }
        else if (Array.isArray(parent)) {
            child = [];
        }
        else if (isTypedArrayOrArrayBuffer(parent)) {
            return parent.slice(0);
        }
        else if (parent instanceof RegExp) {
            child = new RegExp(
                parent.source,
                (parent.global ? 'g' : '') + (parent.ignoreCase ? 'i' : '') + (parent.multiline ? 'm' : '')
            );
            if (parent.lastIndex) {
                child.lastIndex = parent.lastIndex;
            }
        }
        else if (parent instanceof Date) {
            child = new Date(parent.getTime());
        }
        else if (parent instanceof Error) {
            child = Object.create(parent);
        }
        else {
            proto = Object.getPrototypeOf(parent);
            child = Object.create(proto);
        }

        if (circular) {
            var index = allParents.indexOf(parent);

            if (index !== -1) {
                return allChildren[index];
            }
            allParents.push(parent);
            allChildren.push(child);
        }

        if (parent instanceof Map) {
            parent.forEach(function(value, key) {
                var keyChild = _clone(key, depth - 1);
                var valueChild = _clone(value, depth - 1);
                child.set(keyChild, valueChild);
            });
        }
        if (parent instanceof Set) {
            parent.forEach(function(value) {
                var entryChild = _clone(value, depth - 1);
                child.add(entryChild);
            });
        }

        for (let i in parent) {
            var attrs;
            if (proto) {
                attrs = Object.getOwnPropertyDescriptor(proto, i);
            }

            if (attrs && attrs.set === null) {
                continue;
            }
            child[i] = _clone(parent[i], depth - 1);
        }

        if (Object.getOwnPropertySymbols) {
            var symbols = Object.getOwnPropertySymbols(parent);
            for (let i = 0; i < symbols.length; i++) {
                // Don't need to worry about cloning a symbol because it is a primitive,
                // like a number or string.
                var symbol = symbols[i];
                var descriptor = Object.getOwnPropertyDescriptor(parent, symbol);
                if (descriptor && !descriptor.enumerable) {
                    continue;
                }
                child[symbol] = _clone(parent[symbol], depth - 1);
                if (!descriptor.enumerable) {
                    Object.defineProperty(child, symbol, {
                        enumerable: false
                    });
                }
            }
        }

        return child;
    }

    return _clone(parent, depth);
}

export function shallowClone(obj) {
    return clone(obj, true, 1);
}

export function deepClone(obj) {
    return clone(obj, true);
}
