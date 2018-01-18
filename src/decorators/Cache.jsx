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

/**
    @Cache is similar to @Memoize, except that it allows the value to be recomputed when anything it depends on changes.

    It works by setting up a watch on the expression, the first time it's evaluated. It caches the result of the expression,
    and returns that when anyone calls the getter - only reevaluating it if the binder becomes dirty. When the bound expression
    is invalidated, it simply propagates a Binder change event, to trigger anybody to re-call the getter.
**/

import Binder from '../Binder';
import Disposable from '../Disposable';

const binderRecordEvent = Binder.recordEvent;
const binderRecordChange = Binder.recordChange;

export default function(target, property, descriptor) {
    if (!descriptor.get) {
        throw new Error('@Cache can only be applied on getters.');
    }

    if (typeof target === 'function') {
        throw new Error('@Cache cannot be used with static getters.');
    }

    if (!(target instanceof Disposable)) {
        throw new Error('@Cache can only be used on a Disposable class.');
    }

    const _hiddenKey = Symbol(property);
    const _binderKey = Symbol('binder.' + property);

    const onInvalidate = function() {
        if (Binder.mutator) {
            // If somebody is listening to the mutations, we need to eagerly compute the new value,
            // otherwise we could do it lazily.
            const oldValue = this[_hiddenKey];
            const value = this[_binderKey].get();
            if (oldValue === value) {
                return;
            }
            this[_hiddenKey] = value;

            binderRecordChange(this, property, value, oldValue);
            return;
        }

        // We record that the data changed - this will trigger any bound expressions to call the getter again.
        binderRecordChange(this, property);
    };

    const fn = descriptor.get;

    descriptor.get = function() {
        Binder.active && binderRecordEvent(this, property);
        let binder = this[_binderKey];

        if (!binder) {
            // Create a new binder: This always executes the getter immediately, so we just read it back
            // from the previousValue. For future updates, we'll get called when the binder is invalidated.
            const getter = fn.bind(this);
            binder = this.link(new Binder(getter, undefined, true, onInvalidate.bind(this), undefined, this));
            this[_binderKey] = binder;
            this[_hiddenKey] = binder.previousValue;
        }

        if (binder.dirty) {
            this[_hiddenKey] = binder.get();
        }

        return this[_hiddenKey];
    };
}
