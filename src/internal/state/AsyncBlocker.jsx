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

import Global from '../utils/Global';

function error(name) {
    throw new Error('Calling ' + name + ' from a synchronous action is not allowed. Please use an asynchronous action for this: @Action({async: true})');
}

const newSetTimeout = () => error('setTimeout()');
const newSetInterval = () => error('setInterval()');

const NewPromise = function() {
    error('new Promise()');
};
NewPromise.resolve = () => error('Promise.resolve()');
NewPromise.reject = () => error('Promise.reject()');
NewPromise.all = () => error('Promise.all()');
NewPromise.race = () => error('Promise.race()');

const PATCHES = [
    { name: 'setTimeout',  obj: Global,  original: Global.setTimeout,  patch: newSetTimeout },
    { name: 'setInterval', obj: Global,  original: Global.setInterval, patch: newSetInterval },
    { name: 'Promise',     obj: Global,  original: Global.Promise,     patch: NewPromise },

    // Note: We also patch the Promise class directly, because it might be polyfilled by Babel
    // If we don't do this, Promise won't be patched at all.
    { name: 'resolve',     obj: Promise, original: Promise.resolve,    patch: NewPromise.resolve },
    { name: 'reject',      obj: Promise, original: Promise.reject,     patch: NewPromise.reject },
    { name: 'all',         obj: Promise, original: Promise.all,        patch: NewPromise.all },
    { name: 'race',        obj: Promise, original: Promise.race,       patch: NewPromise.race },
];

/**
 * AsyncBlocker lets you block asynchronous calls while executing a function.
 * This only handles a few common cases - blocking promises and setTimeout/setInterval
 * It's useful to catch some accidental asynchronous actions that aren't marked as being asynchronous.
 */
export default class AsyncBlocker {
    static execute(fn) {
        PATCHES.forEach(patch => patch.obj[patch.name] = patch.patch);
        try {
            return fn();
        }
        finally {
            PATCHES.forEach(patch => patch.obj[patch.name] = patch.original);
        }
    }
}
