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
    Middleware for the redux-devtools-extension: Just install the extension and include this middleware when creating your store!
    https://github.com/zalmoxisus/redux-devtools-extension
**/

import Disposable from '../Disposable';
import ActionDispatcher from '../internal/state/ActionDispatcher';

var devTools = function() {
    return typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__;
};

class DevToolConnector extends Disposable {

    constructor(store) {
        super();

        this.store = store;

        if (!devTools()) {
            console.warn('redux-devtools-extension is not installed. See https://github.com/zalmoxisus/redux-devtools-extension');
            return;
        }

        this.devTools = devTools().connect({
            name: store.storeName || Object.getPrototypeOf(store).constructor.name
        });
        this.devTools.subscribe(this.onMessage);
    }

    onAction(action, payload) {
        if (!this.devTools) {
            return;
        }

        if (this.handlingMessage) {
            // Ignore any actions that happen in response to our debugging
        }

        if (action === ActionDispatcher.INIT_ACTION) {
            this.initState = this.store.toJSON();
            this.devTools.init(this.initState);
            return;
        }

        this.devTools.send({ type: action, payload }, this.store.toJSON());
    }

    setState(state) {
        // Specially, we pretend we're inside of an action
        ActionDispatcher.start('DEVTOOLS');
        this.store.fromJSON(state);
        ActionDispatcher.end('DEVTOOLS');
    }

    toggleAction(actionId, liftedState) {
        // Find the action - it's either skipped already (so we unskip it), or staged (so we skip it).
        var skippedIndex = liftedState.skippedActionIds.indexOf(actionId);
        var stagedIndex = liftedState.stagedActionIds.indexOf(actionId);

        if (stagedIndex === -1) {
            // The action doesn't exist, so toggling won't do anything
            return liftedState;
        }

        // Restore the state to what it was, just before the action
        this.setState(liftedState.computedStates[stagedIndex - 1].state);

        if (skippedIndex !== -1) {
            // If the action is currently skipped, unskip it
            var action = liftedState.actionsById[stagedIndex].action;
            this.store.dispatch(action.type, ...action.payload);
            liftedState.skippedActionIds.splice(skippedIndex, 1);
        }
        else {
            // Otherwise, skip it
            liftedState.skippedActionIds.push(actionId);
        }
        liftedState.computedStates[stagedIndex].state = this.store.toJSON();

        // Replay the rest of the actions, if they're not skipped
        for (var i = stagedIndex + 1; i < liftedState.stagedActionIds.length; i++) {
            var replayActionId = liftedState.stagedActionIds[i];
            if (liftedState.skippedActionIds.indexOf(replayActionId) === -1) {
                var replayAction = liftedState.actionsById[replayActionId].action;
                this.store.dispatch(replayAction.type, ...replayAction.payload);
            }
            liftedState.computedStates[i].state = this.store.toJSON();
        }

        return liftedState;
    }

    @Bind
    onMessage(message) {
        this.handlingMessage = true;

        var messageState = message.state && JSON.parse(message.state);

        if (message.type === 'DISPATCH') {
            switch (message.payload.type) {
            case 'RESET':
                this.setState(this.initState);
                this.devTools.init(this.initState);
                break;
            case 'COMMIT':
                this.devTools.init(this.store.toJSON());
                break;
            case 'ROLLBACK':
                this.setState(messageState);
                this.devTools.init(messageState);
                break;
            case 'JUMP_TO_STATE':
            case 'JUMP_TO_ACTION':
                this.setState(messageState);
                break;
            case 'TOGGLE_ACTION': {
                let liftedState = this.toggleAction(message.payload.id, messageState);
                this.devTools.send(null, liftedState);
                break;
            }
            case 'IMPORT_STATE': {
                let liftedState = message.payload.nextLiftedState;
                let computedStates = liftedState.computedStates;
                this.setState(computedStates[computedStates.length - 1].state);
                this.devTools.send(null, liftedState);
                break;
            }
            }
        }
        else if (message.type === 'ACTION') {
            // Execute an operation on the store
            try {
                new Function(message.payload).call(this.store);
            }
            catch (e) {
                console.warn('Error executing action: ' + message.payload);
                console.warn(e);
            }
        }

        this.handlingMessage = false;
    }

    dispose() {
        if (!this.devTools) {
            return;
        }

        this.devTools.unsubscribe();
        delete this.devTools;
        devTools().disconnect();
    }
}

var remoteDevMiddleware = function(store, action, payload, next) {
    if (!store._devToolConnector) {
        store._devToolConnector = store.link(new DevToolConnector(store));
    }

    // Let the action be processed
    const retVal = next();

    store._devToolConnector.onAction(action, payload);

    return retVal;
};

export default remoteDevMiddleware;
