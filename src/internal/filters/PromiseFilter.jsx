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

import Signal from '../../Signal';

const state = Symbol('state');

/** @private */
export default function PromiseFilter(bindings, value) {
    if (value && (value instanceof Promise)) {
        var binding = value[state];
        if (!binding) {
            binding = value[state] = { resolved: false, value: undefined };
            binding.obj = binding;

            value.then((result) => {
                binding.resolved = true;
                binding.value = result;
                Signal.trigger(binding, 'update');
            });
        }

        if (!binding.resolved) {
            // We need to push a new object everytime, otherwise we are going to share the same invalidate callback
            // with other binders and that is not going to work correctly.
            bindings.push({ eventName: 'update', obj: binding });
        }

        // The binding contains the value inside.
        return binding;
    }
}
