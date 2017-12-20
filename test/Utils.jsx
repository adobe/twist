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

import assert from 'assert';

export default class Utils {

    static assertError(expr, errorMessage) {
        var error;
        try {
            expr();
        }
        catch (e) {
            error = e;
        }

        assert.equal(error && error.message, errorMessage);
    }

    static getMiddleware() {

        var middleware = {
            actions: [],
            fn(store, action, payload, next) {
                if (middleware.store) {
                    assert.equal(store, middleware.store);
                }
                middleware.actions.push(action);
                return next();
            }
        };

        return middleware;
    }
}
