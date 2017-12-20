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

export default function(wrapper, origSuffix, ...args) {
    return function Wrap(property) {
        let value = property.getValue();
        let key = property.name;
        let workaroundKey = key + '__Safari_workaround';

        if (origSuffix) {
            // [nowKey] is the original function
            let nowKey = key + origSuffix;
            Object.defineProperty(property.ref, nowKey, { value });
        }

        property.setGetter(function() {
            if (property.ref === this) {
                // The prototype should not bind the value.
                return value;
            }

            // This is a workaround for a bug in Safari that would execute the
            // getter even after the property was replaced with a fixed value.
            let wrapped = this[workaroundKey];
            if (wrapped) {
                return wrapped;
            }

            wrapped = wrapper(value, ...args);
            let descriptor = { value: wrapped, enumerable: false, configurable: true };
            Object.defineProperty(this, key, descriptor);
            Object.defineProperty(this, workaroundKey, descriptor);

            return wrapped;
        });
    };
}
