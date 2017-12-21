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

/* global it, describe */

import assert from 'assert';
import sinon from 'sinon';

import { Store, State, Action, remoteDevMiddleware } from '../../index';

/**
    Mocking the devtools interface
**/

class DevTools {
    init() {

    }

    subscribe() {

    }

    unsubscribe() {

    }

    send() {

    }
}

class DevToolsInterface {
    static connected = false;

    static connect() {
        DevToolsInterface.connected = true;
        return new DevTools();
    }

    static disconnect() {
        DevToolsInterface.connected = false;
    }
}

/**
    Tests
**/

@Store
class TestStore {
    @State.byVal x;

    @Action INCR() {
        this.x++;
    }
}

describe('Devtools Middleware', () => {

    it('Enable devtools middleware - should give warning if devtools not installed', () => {

        // Make sure it's really not installed
        window.__REDUX_DEVTOOLS_EXTENSION__ = undefined;

        sinon.spy(console, 'warn');

        new TestStore({ x: 2 }, [ remoteDevMiddleware ]);

        assert(console.warn.calledWith('redux-devtools-extension is not installed. See https://github.com/zalmoxisus/redux-devtools-extension'));
        console.warn.restore();
    });

    it('Enable devtools middleware - should connect and disconnect', () => {

        // Make sure it's really not installed
        window.__REDUX_DEVTOOLS_EXTENSION__ = DevToolsInterface;

        // Can set middleware without an array, if it's just one item
        var test = new TestStore({ x: 2 }, remoteDevMiddleware);

        assert.equal(DevToolsInterface.connected, true);

        test.dispose();
        assert.equal(DevToolsInterface.connected, false);

        window.__REDUX_DEVTOOLS_EXTENSION__ = undefined;
    });

});
