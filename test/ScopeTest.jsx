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

import { Scope } from '../index';
import assert from 'assert';

describe('JSX.Scope', () => {

    it('should be able to create a scope', () => {
        let scope = new Scope();
        scope.defineObservable('myValue', 1);

        assert.equal(scope.myValue, 1, 'Reading bindable value from scope');
    });

    it('should be able to create a nested scope', () => {
        let parentScope = new Scope();
        parentScope.defineObservable('myValue', 1);

        let nestedScope = parentScope.fork();

        assert.equal(parentScope.myValue, 1, 'Reading bindable value from parent scope');
        assert.equal(nestedScope.myValue, 1, 'Reading bindable value from nested scope');

        parentScope.myValue = 2;

        assert.equal(parentScope.myValue, 2, 'Reading bindable value from parent scope after change on parent scope');
        assert.equal(nestedScope.myValue, 2, 'Reading bindable value from nested scope after change on parent scope');

        nestedScope.myValue = 3;

        assert.equal(parentScope.myValue, 3, 'Reading bindable value from parent scope after change on nested scope');
        assert.equal(nestedScope.myValue, 3, 'Reading bindable value from nested scope after change on nested scope');
    });

    it('should be able to clean a scope', () => {
        let scope = new Scope();
        scope.myValue = 1;

        assert.equal(scope.myValue, 1, 'Reading own property value from scope');

        scope.clean();

        assert.equal(scope.myValue, undefined, 'Own property value should be deleted after scope.clean');
    });

});
