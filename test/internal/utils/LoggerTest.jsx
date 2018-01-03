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
/* global describe it */

import assert from 'assert';
import sinon from 'sinon';
import Logger from '../../../src/internal/utils/Logger';

describe('Utils.Logger', () => {

    it('Logger.log', () => {
        sinon.spy(console, 'log');

        Logger.log('Test1', 'Test2');
        assert(console.log.calledWith('Test1', 'Test2'));

        console.log.restore();
    });

    it('Logger.assert', () => {
        sinon.spy(console, 'assert');

        Logger.assert('Test1', 'Test2');
        assert(console.assert.calledWith('Test1', 'Test2'));

        console.assert.restore();
    });

    it('Logger.table', () => {
        sinon.spy(console, 'table');

        Logger.table('Test1', 'Test2');
        assert(console.table.calledWith('Test1', 'Test2'));

        console.table.restore();
    });

    it('Logger.groupStart', () => {
        sinon.spy(console, 'group');

        Logger.groupStart('Test1', 'Test2');
        assert(console.group.calledWith('Test1', 'Test2'));

        console.group.restore();
    });

    it('Logger.groupEnd', () => {
        sinon.spy(console, 'groupEnd');

        Logger.groupEnd('Test1', 'Test2');
        assert(console.groupEnd.calledWith('Test1', 'Test2'));

        console.groupEnd.restore();
    });

});
