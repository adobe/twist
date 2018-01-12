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

function disposeHelper(disposable) {
    if (disposable.dispose) {
        disposable.dispose();
        return;
    }

    if (typeof disposable === 'function') {
        disposable();
    }
}

const _disposables = Symbol('disposables');
const _isDisposed = Symbol('isDisposed');

/**
 * A Disposable instance exposes an interface for cleaning up an object when it is no longer needed.
 * A disposable can be linked to any number of children disposables, so that when the parent is disposed,
 * children will also be disposed, and so on.
 */
export default class Disposable {

    [_isDisposed] = false;

    /**
     * Whether or not the disposable object has already been disposed
     */
    get isDisposed() {
        return this[_isDisposed];
    }

    /**
     * Link a child Disposable to this disposable. When this class is disposed, the child will also be disposed.
     * @param {Disposable} disposable
     * @return {Disposable} the provided disposable
     */
    link(disposable) {
        var disposables = this[_disposables];
        if (!disposables) {
            disposables = this[_disposables] = [];
        }
        disposables.push(disposable);
        return disposable;
    }

    /**
     * Unlink a child Disposable from this disposable. If the child is already unlinked, do nothing.
     * @param {Disposable} disposable
     */
    unlink(disposable) {
        var disposables = this[_disposables];
        if (!disposables) {
            return;
        }

        var index = disposables.indexOf(disposable);
        if (index !== -1) {
            disposables.splice(index, 1);
        }
    }

    /**
     * Unlink a child and dispose it.
     * @param {Disposable} disposable
     */
    disposeLink(disposable) {
        this.unlink(disposable);
        disposeHelper(disposable);
    }

    /**
     * Dispose this instance. Any disposables linked to this instance will also be disposed.
     */
    dispose() {
        this[_isDisposed] = true;

        var disposables = this[_disposables];
        if (!disposables) {
            return;
        }

        this[_disposables] = null;
        for (var i = disposables.length - 1; i >= 0; --i) {
            disposeHelper(disposables[i]);
        }
    }

}
