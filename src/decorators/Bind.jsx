/*
 *  Copyright 2016 Adobe Systems Incorporated. All rights reserved.
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

import DecoratorUtils from './DecoratorUtils';

export default function Bind(target, property, descriptor) {
    const fn = DecoratorUtils.getInitialValue(descriptor);
    if (typeof fn !== 'function') {
        throw new Error(`@Bind can only be applied to a function. (property: ${property})`);
    }

    delete descriptor.value;
    delete descriptor.writable;
    descriptor.get = function() {
        if (target === this) {
            return fn; // If it's accessed via `prototype` the first time, we don't want to bind to the prototype.
        }
        // Next time just return the bound value directly.
        const bound = fn.bind(this);
        Object.defineProperty(this, property, { configurable: true, enumerable: false, value: bound });
        return bound;
    };
}
