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

import TaskQueue from '../TaskQueue';
import DecoratorUtils from '../internal/utils/DecoratorUtils';

export default DecoratorUtils.makePropertyDecorator((target, property, descriptor, taskQueue, priority) => {
    if (typeof taskQueue === 'number') {
        priority = taskQueue;
        taskQueue = TaskQueue;
    }
    else {
        if (!taskQueue) {
            taskQueue = TaskQueue;
        }
        if (typeof priority !== 'number') {
            priority = 0;
        }
    }

    let value = DecoratorUtils.getInitialValue(descriptor);
    let taskName = '_task_' + property;

    delete descriptor.value;
    delete descriptor.writable;
    descriptor.get = function() {
        if (target === this) {
            // The prototype should not bind the value.
            return value;
        }

        let args;

        // This is a workaround for a bug in Safari that would
        // execute the getter even after the property was replaced with a fixed value.
        let pusher = this[taskName];
        if (pusher) {
            return pusher;
        }

        let binded = () => {
            if (!this.isDisposed) {
                value.apply(this, args);
            }
        };

        pusher = (...rest) => {
            args = rest;
            taskQueue.push(binded, priority);
        };
        pusher.cancel = () => {
            taskQueue.remove(binded);
        };

        // Next time just return the binded value directly.
        Object.defineProperty(this, taskName, { value: pusher, enumerable: false });
        Object.defineProperty(this, property, { value: pusher, enumerable: false });

        return pusher;
    };
});
