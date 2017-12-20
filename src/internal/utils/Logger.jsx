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

/* eslint no-console: "off" */

/**
    @private

    Utilities for logging to the console.
    This allows us to keep all the console logs in one place, so we
    don't need to disable the no-console rule in other files.

    NEVER use this for debugging, since we want the linter to prevent
    us from checking in debug console.log statements.
**/
export default class Logger {

    static log() {
        console.log.apply(console, arguments);
    }

    static assert() {
        console.assert.apply(console, arguments);
    }

    static table() {
        console.table.apply(console, arguments);
    }

    static groupStart() {
        console.group.apply(console, arguments);
    }

    static groupEnd() {
        console.groupEnd.apply(console, arguments);
    }

}
