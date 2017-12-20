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

import Binder from '../Binder';

const binderRecordEvent = Binder.recordEvent;
const binderRecordChange = Binder.recordChange;
const PropertyDefaultValue = { defaultValue: true };

export default function Observable(target, property, descriptor) {
    const hiddenKey = '_' + property;

    const init = descriptor.initializer;
    if (init) {
        Object.defineProperty(target, hiddenKey, {
            configurable: true,
            enumerable: false,
            writable: true,
            value: PropertyDefaultValue
        });
    }
    else if (target[hiddenKey] === PropertyDefaultValue) {
        // The parent class already defined this property.

        // NOTE: Ideally, we would just *not* define a property here and let this property fall through the prototype
        // chain. However, transform-decorators-legacy requires us to define a property, using either the descriptor
        // passed to this function or the return value here. So we'll shim one in for now that just redirects upward.
        return {
            configurable: true,
            enumerable: false,
            get() {
                delete target[property];
                return this[property];
            },
            set(value) {
                delete target[property];
                this[property] = value;
            }
        };
    }

    // Make a map of defined observables, so we can emit warnings if they
    // mistakenly use @Observable instead of @Attribute.
    var definedObservables = target.definedObservables;

    // We might have inherited the definedObservables. Check for own property.
    if (!target.hasOwnProperty('definedObservables')) {
        definedObservables = definedObservables ? Object.assign({}, definedObservables) : {};
        Object.defineProperty(target, 'definedObservables', {
            configurable: true,
            enumerable: false,
            writable: true,
            value: definedObservables
        });
    }

    definedObservables[property] = true;
    return {
        configurable: true,
        enumerable: false,
        get() {
            Binder.active && binderRecordEvent(this, property);
            var value = this[hiddenKey];
            if (value === PropertyDefaultValue) {
                value = this[hiddenKey] = init.call(this);
            }
            return value;
        },
        set(value) {
            var oldValue = this[hiddenKey];
            if (oldValue === PropertyDefaultValue) {
                oldValue = this[hiddenKey] = init.call(this);
            }
            if (oldValue === value) {
                return;
            }
            this[hiddenKey] = value;
            binderRecordChange(this, property, value, oldValue);
        }
    };
}
