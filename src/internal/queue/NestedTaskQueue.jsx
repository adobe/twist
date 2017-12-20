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

import BaseTaskQueue from './BaseTaskQueue';
import Bind from '../decorators/Bind';

export default class NestedTaskQueue extends BaseTaskQueue {

    constructor(parent, name, priority) {
        super();
        this.parent = parent;
        this.name = name;
        this.priority = priority;
    }

    @Bind
    enqueue() {
        this.parent.push(this.run, this.priority);
    }

    register(useAfterQueue) {
        if (useAfterQueue) {
            // When we are on the after branch, we don't want to execute in the same request animation frame call, so we are going to wait and execute on the next one.
            this.parent.after.push(this.enqueue);
        }
        else {
            this.enqueue();
        }
    }

}
