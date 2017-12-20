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

import ObservableBase from './internal/ObservableBase';
import Binder from './Binder';
import Signal from './Signal';

import Bind from './decorators/Bind';

export default class CollectionBinder extends Binder {

    update(value, invokeCallback = true) {
        const { previousValue } = this;
        if (previousValue === value) {
            // We just have the same collection. Most probably we've updated the length?
            if (!this.lengthChanged) {
                // Nothing really changed.
                return false;
            }

            // Reset the flag back to normal.
            this.lengthChanged = false;

            if (invokeCallback) {
                this.invokeCallback(value);
            }

            // The length event came, which ObservableArray uses to notify any mutation on the array,
            // so we need to notify our caller about the mutation.
            return true;
        }

        // This is the first time we actually compute this expression.
        if (previousValue === this.FirstExecutionMarker) {
            this.previousValue = value;
        }
        else if (previousValue && typeof previousValue === 'object') {
            Signal.stopListening(this, previousValue);
        }

        // Reset any previous lengthChanged flag.
        this.lengthChanged = false;

        if (value && typeof value === 'object') {
            // Just in case, attach our callback
            Signal.listenTo(this, value, 'change', this.onLengthChanged);
        }

        if (invokeCallback) {
            this.invokeCallback(value);
        }

        return true;
    }

    @Bind
    onLengthChanged() {
        // We flag the fact that we've received a lengthChanged event, so that we can check
        // later on when the actual array is going to be the same. In that case, if the length flag is set
        // we will actually resend the callback to the caller even though the array is actually the same, but it might
        // have different items.
        this.lengthChanged = true;
        this.invalidate();
    }

    invokeCallback(value) {
        if (value instanceof ObservableBase) {
            this.callback(value.base);
            return;
        }
        this.callback(value);
    }

}
