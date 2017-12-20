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
    Middleware for protecting synchronous actions - this prevents common asynchronous operations (setTimeout, promises etc)
    from being used inside of synchronous actions, since this won't work with reduxDevtools (actions need to be deterministic so
    they can be replayed). We recommend enabling this middleware during development, to help catch bugs.
**/

import AsyncBlocker from '../internal/state/AsyncBlocker';

var protectorMiddleware = function(store, action, payload, next) {

    // This runs the actual dispatch code in a mode where certain common asynchronous operations (Promise, setTimeout, etc) are blocked.
    // We do this in the remote dev middleware so that developers can get this check, but we're not doing any patching in production code.
    return AsyncBlocker.execute(next);
};

export default protectorMiddleware;
