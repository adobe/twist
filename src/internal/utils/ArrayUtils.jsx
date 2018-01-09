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

function arrayFindImpl(fn, thisArg) {
    for (let i = 0, len = this.length; i < len; i++) {
        const item = this[i];
        if (fn.call(thisArg, item, i, this)) {
            return item;
        }
    }
}

/**
 * Utilities for operations on arrays
 */
export default class ArrayUtils {

    static find(array, fn, thisArg) {
        if (!array) {
            return;
        }
        return (Array.prototype.find || arrayFindImpl).call(array, fn, thisArg);
    }

    static polyfill() {
        if (!Array.prototype.find) {
            Array.prototype.find = arrayFindImpl;
        }
    }
}
