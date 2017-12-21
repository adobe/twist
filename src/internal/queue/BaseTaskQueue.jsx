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

import ObjectId from '../../ObjectId';
import Abstract from '../../decorators/Abstract';
import Bind from '../../decorators/Bind';

export default class TaskQueue {

    running = false;
    registered = false;

    constructor() {
        this.itemMap = { };

        this.maxBucket = -1;
        this.buckets = [];
        this.bucketMap = { };
    }

    @Abstract
    register(/* useAfterQueue */) {
    }

    push(callback, priority, lateBinder) {
        // There are a couple of cases that can get us here:
        // 1. The callback has never been added to this queue.
        // 2. The callback has been added, but has not executed yet.
        // 3. The callback has been added, executed in this queue run, but we are still executing the queue.
        // 4. The callback has been added, executed before, but we are not executing the queue.

        var id = ObjectId.get(callback);

        // Make sure our priority is a number.
        priority = Number(priority) || 0;

        var item = this.itemMap[id];
        if (item) {
            item.lateBinder = lateBinder;

            // Make sure we are still executing this item.
            item.cancel = false;

            // The item has been added to the queue before. Update the priority if needed.
            if (item.priority !== priority) {
                // Move the item to the correct priority bucket.
                var bucketItems = item.bucket.items;
                var index = bucketItems.indexOf(item);
                bucketItems[index] = null;

                item.priority = priority;

                // falltrough to adding this item to the correct bucket.
            }
            else if (!item.executed) {
                // We are still waiting to execute this item, no need to queue it again.
                return;
            }

            // Make sure we don't register it again until it actually runs.
            item.executed = false;
        }
        else {
            // Totally new callback, just create the item for it.
            item = { callback, priority, cancel: false, executed: false, lateBinder };
            this.itemMap[id] = item;
        }

        // Just put the item back on the list so that we pick it up again in our queue execution.

        var bucket = this.bucketMap[priority] || this._makeBucket(priority);

        this.maxBucket = Math.max(this.maxBucket, bucket.index);
        item.bucket = bucket;
        bucket.items.push(item);

        this.registerIfNeeded();
    }

    _makeBucket(priority) {
        var buckets = this.buckets;
        var i = 0, j = buckets.length - 1;
        while (i <= j) {
            var mid = Math.round((i + j) / 2);
            // Sorting in reverse. Lower numbers are at the end.
            if (buckets[mid].priority < priority) {
                j = mid - 1;
            }
            else {
                i = mid + 1;
            }
        }

        // Uncomment the following code to verify the lookup that we do in the previous loop.
        // if (buckets.length) {
        //     // we are going to replace bucket[i] with the new bucket.
        //     // make sure that the one we move to the right has a smaller priority.
        //     console.assert(i < buckets.length ? buckets[i].priority < priority : buckets[i - 1].priority > priority, "Buckets are supposed to be in the right order");
        // }
        // else {
        //     console.assert(!i);
        // }

        // Inject the new bucket.
        var bucket = this.bucketMap[priority] = {
            priority,
            items: [],
            index: i
        };
        this.buckets.splice(i, 0, bucket);

        if (i <= this.maxBucket) {
            // We've added a new bucket before the previous max bucket.
            // Just increment the old one that is now moved to the right.
            ++this.maxBucket;
        }

        // Update the index for the remaining items. The indexes have incremented by one.
        for (var l = buckets.length; i < l; ++i) {
            buckets[i].index = i;
        }

        return bucket;
    }

    wrap(callback, priority, lateBinder) {
        return () => this.push(callback, priority || 0, lateBinder);
    }

    registerIfNeeded() {
        if (!this.registered) {
            this.registered = true;
            this.register(this.inAfterCall);
        }
    }

    get after() {
        var after = this._after;
        if (!after) {
            after = this._after = new AfterTaskQueue(this);
        }
        return after;
    }

    remove(callback) {
        var id = ObjectId.get(callback);
        var item = this.itemMap[id];
        if (item) {
            // Rever the item back to canceled state.
            item.executed = false;
            item.cancel = true;
        }
    }

    execHoisted(hoisted) {
        while (hoisted.length) {
            var callback = hoisted.pop();
            if (callback.cancel) {
                continue;
            }

            callback.executed = true;
            callback.callback();
        }
    }

    execCallbacks(hoisted) {
        var buckets = this.buckets;

        // We need to always keep an eye on the last bucket as new buckets might have been added.
        while (this.maxBucket >= 0) {
            var bucket = buckets[this.maxBucket];

            var items = bucket.items;
            if (!items.length) {
                // Go one back when we are left without items.
                --this.maxBucket;
                continue;
            }

            var callback = items.pop();
            if (!callback || callback.cancel) {
                continue;
            }

            if (callback.lateBinder) {
                // We need to move this item all the way to the bottom of the list.
                // Note that we skip this process if this is the last callback anyway.
                if (!hoisted) {
                    hoisted = [ callback ];
                }
                else {
                    hoisted.push(callback);
                }
                continue;
            }

            callback.executed = true;
            callback.callback();
        }

        return hoisted;
    }

    @Bind
    run() {
        if (this.maxBucket >= 0) {
            this.running = true;

            var hoisted = null;

            // We can get back to the while condition check after an exception is thrown.
            // In that case we either have more callbacks or more hoisted items.
            while (this.maxBucket >= 0 || hoisted) {
                // Nest with try catch, in case one callback throws exception,
                // we can still execute the follwing callbacks.
                try {
                    while (this.maxBucket >= 0 || hoisted) {
                        hoisted = this.execCallbacks(hoisted);

                        if (hoisted) {
                            this.execHoisted(hoisted);
                            hoisted = null;
                        }
                    }
                }
                catch (e) {
                    console.error(e);
                    console.error(e.stack);
                }
            }

            this.running = false;
        }

        // for (var i = 0, l = this.buckets.length; i < l; ++i) {
        //     var bucket = this.buckets[i];
        //     if (bucket.items.length) {
        //         console.log(`Bucket ${ i } - ${ bucket.index } is not empty`, bucket.items.length, bucket, this.buckets);
        //     }
        // }

        this.itemMap = { };
        this.registered = false;

        var after = this._after;
        if (after) {
            this.inAfterCall = true;
            after.run();
            this.inAfterCall = false;
        }
    }

    @Bind
    quickRun() {
        if (this.maxBucket >= 0) {
            this.running = true;

            var hoisted = null;

            while (this.maxBucket >= 0 || hoisted) {
                hoisted = this.execCallbacks(hoisted);

                if (hoisted) {
                    this.execHoisted(hoisted);
                    hoisted = null;
                }
            }

            this.running = false;
        }

        // for (var i = 0, l = this.buckets.length; i < l; ++i) {
        //     var bucket = this.buckets[i];
        //     if (bucket.items.length) {
        //         console.log(`Bucket ${ i } - ${ bucket.index } is not empty`, bucket.items.length, bucket, this.buckets);
        //     }
        // }

        this.itemMap = { };
        this.registered = false;

        var after = this._after;
        if (after) {
            this.inAfterCall = true;
            after.run();
            this.inAfterCall = false;
        }
    }

}

export class AfterTaskQueue extends TaskQueue {

    constructor(parent) {
        super();
        this.parent = parent;
    }

    register() {
        this.parent.registerIfNeeded();
    }

}
