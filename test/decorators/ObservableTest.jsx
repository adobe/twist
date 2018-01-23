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

/* global describe it */

import assert from 'assert';
import { Binder, Signal, TaskQueue } from '../../index';

describe('Observable Decorator', () => {

    it('default value', () => {
        class Data {
            @Observable value = 'default value';
        }

        let data = new Data;
        assert.equal(data.value, 'default value');
    });

    it('inherited default value', () => {
        class Base {
            @Observable value = 'default value';
        }

        class Subclass extends Base {
            @Observable value;
        }

        let data1 = new Base;
        let data2 = new Subclass;

        assert.equal(data1.value, 'default value');
        assert.equal(data2.value, 'default value');
    });

    it('replace default value', () => {
        class Base {
            @Observable value = 'default value';
        }

        class Subclass extends Base {
            @Observable value = 'subclass default value';
        }

        let data1 = new Base;
        let data2 = new Subclass;

        assert.equal(data1.value, 'default value');
        assert.equal(data2.value, 'subclass default value');
    });

    it('check for events', () => {
        class Data {
            @Observable value = 'default value';
        }

        let data = new Data;

        let changed = false;
        Signal.on(data, 'value', () => changed = true);
        data.value = 'changed value';

        assert(changed, 'value change event was triggered');
        assert.equal(data.value, 'changed value');
    });

    it('check for inherited classes events', () => {
        class Base {
            @Observable value = 'default value';
        }

        class Subclass extends Base {
            @Observable value;
        }

        let data = new Subclass;

        let changed = false;
        Signal.on(data, 'value', () => changed = true);
        data.value = 'changed value';

        assert(changed, 'value change event was triggered');
        assert.equal(data.value, 'changed value');
    });

    it('triggers an update when changed asynchronously', done => {
        let nCalls = 0;

        class Data {
            @Observable value = 'default value';
        }

        let data = new Data;
        let binder;

        let onDone = error => {
            binder.dispose();
            done(error);
        };

        binder = new Binder(
            () => 'my value is ' + data.value,
            value => {
                nCalls = nCalls + 1;
                if (nCalls === 1) {
                    if (value !== 'my value is default value') {
                        return onDone(new Error('Initial call had incorrect response: ' + value));
                    }
                }
                else if (nCalls === 2) {
                    if (value === 'my value is updated value') {
                        return onDone();
                    }
                    else {
                        return onDone(new Error('Second call had incorrect response: ' + value));
                    }
                }
                else {
                    return onDone(new Error('Too many calls to binder update func.'));
                }
            });

        TaskQueue.run();

        setTimeout(
            () => {
                data.value = 'updated value';
                TaskQueue.run();
            }, 0);
    });

    it('should not invalidate binders if change a NaN to a NaN', () => {
        class Data {
            @Observable value = 42;
        }

        let data = new Data;
        let invalidateCount = 0;
        new Binder(() => data.value, undefined, true, () => invalidateCount++);

        assert.equal(invalidateCount, 0);

        data.value = 0;
        assert.equal(invalidateCount, 1);

        data.value = NaN;
        assert.equal(invalidateCount, 2);

        data.value = NaN;
        assert.equal(invalidateCount, 2);
    });

});
