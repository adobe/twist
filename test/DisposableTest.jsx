/*
 *  Copyright 2017 Adobe Systems Incorporated. All rights reserved.
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

import { Disposable } from '../index';
import assert from 'assert';
import sinon from 'sinon';

describe('Utils.Disposable', () => {

    it('disposes children', () => {
        let parent = new Disposable();
        let child = new Disposable();
        parent.link(child);

        let spy = sinon.spy(child, 'dispose');
        parent.dispose();
        assert(spy.calledOnce, 'child dispose should be called');
    });

    it('unlink', () => {
        let parent = new Disposable();
        let child = new Disposable();
        parent.link(child);
        parent.unlink(child);
        let spy = sinon.spy(child, 'dispose');
        parent.dispose();
        assert(spy.notCalled, 'child dispose should not be called');
    });

    it('unlink when no disposables exist (should not throw)', () => {
        let parent = new Disposable();
        parent.unlink(null);
        parent.unlink(new Disposable());
    });

    it('set disposables, but then try to unlink a non-child', () => {
        let parent = new Disposable();
        parent.link(new Disposable());
        parent.unlink(new Disposable());
    });

    it('disposes a function', () => {
        let parent = new Disposable();
        let childFn = sinon.spy();
        parent.link(childFn);
        parent.disposeLink(childFn);
        assert(childFn.calledOnce, 'child disposed should be called');
    });

    it('disposeLink', () => {
        let parent = new Disposable();
        let child = new Disposable();
        parent.link(child);
        let spy = sinon.spy(child, 'dispose');
        parent.disposeLink(child);
        assert(spy.calledOnce, 'child dispose should be called');
    });

    it('tree of disposables', () => {
        let grandparent = new Disposable();
        let parent = new Disposable();
        let child = new Disposable();
        grandparent.link(parent);
        parent.link(child);

        let parentSpy = sinon.spy(parent, 'dispose');
        let childSpy = sinon.spy(child, 'dispose');
        grandparent.dispose();
        assert(parentSpy.calledOnce, 'parent dispose should be called');
        assert(childSpy.calledOnce, 'child dispose should be called');
    });

});
