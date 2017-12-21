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

/** @private */
const ARRAY_TYPES = [
    Array,
    Int8Array,
    Uint8Array,
    Int16Array,
    Uint16Array,
    Int32Array,
    Uint32Array,
    Float32Array,
    Float64Array,
];

// Early versions of IE11 don't include UInt8ClampedArray.
// This check can be removed when we no longer need to support IE11.
if (typeof Uint8ClampedArray !== 'undefined') {
    ARRAY_TYPES.push(Uint8ClampedArray);
}

/** @private */
function isArrayOrTypedArray(a, b) {
    return ARRAY_TYPES.some((arrayType) => a instanceof arrayType && b instanceof arrayType);
}

/**
 * Utilities for operations on objects
 */
export default class ObjectUtils {

    /**
     * Return true if `a` and `b` are deeply equivalent.
     * Deeply understands Object, Array, TypedArray, ArrayBuffer, Date, Map, Set, and RegExp types.
     * Other values are compared using strict equality (`===`).
     */
    static deepEqual(a, b) {
        // In simple cases, we can compare values without traversal.
        if (a === b) {
            return true;
        }
        if (typeof a !== typeof b) {
            return false;
        }
        if (a instanceof Date && b instanceof Date) {
            return a.getTime() === b.getTime();
        }
        if (a instanceof RegExp && b instanceof RegExp) {
            return a.toString() === b.toString();
        }
        if (a instanceof ArrayBuffer && b instanceof ArrayBuffer) {
            return this.deepEqual(new Uint8Array(a), new Uint8Array(b));
        }
        if ((a instanceof Map && b instanceof Map) || (a instanceof Set && b instanceof Set)) {
            return this.deepEqual(Array.from(a), Array.from(b));
        }

        if (isArrayOrTypedArray(a, b)) {
            const isTypedArray = !Array.isArray(a);
            if (a.length !== b.length) {
                return false;
            }
            for (let i = 0, len = a.length; i < len; i++) {
                if (isTypedArray) {
                    if (a[i] !== b[i]) {
                        return false;
                    }
                }
                else {
                    if (!this.deepEqual(a[i], b[i])) {
                        return false;
                    }
                }
            }
            return true;
        }

        if (typeof a === 'object' && typeof b === 'object') {
            let aKeys = Object.keys(a); // Only traverse own (not inherited) properties.
            let bKeys = Object.keys(b);
            aKeys.sort();
            bKeys.sort();
            return this.deepEqual(aKeys, bKeys) && aKeys.every(k => this.deepEqual(a[k], b[k]));
        }
        // In all other cases, these objects are not considered equivalent.
        return false;
    }
}
