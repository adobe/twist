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

// Record the stack of actions we're currently dispatching. This is used to
// (a) prevent actions from firing other actions, and (b) prevent state updates outside of an action.
var currentActions = [];

export default class ActionDispatcher {

    /**
        Built-in action types
    **/

    static IMPLICIT_ACTION_PREFIX = '@';
    static INIT_ACTION = ActionDispatcher.IMPLICIT_ACTION_PREFIX + '@INIT';


    /**
        Handling dispatch status
    **/

    static get active() {
        return currentActions.length > 0;
    }

    static start(action) {
        currentActions.push(action);
    }

    static end(action) {
        let currentAction = currentActions[currentActions.length - 1];
        if (action !== currentAction) {
            throw new Error('ActionDispatcher: Expected to end ' + currentAction + ', but instead ended a different action of type ' + action);
        }

        currentActions.pop();
    }
}
