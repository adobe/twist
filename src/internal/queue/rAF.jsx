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

// rAF stands for RequestAnimationFrame
import BaseTaskQueue from './BaseTaskQueue';
import Global from '../utils/Global';
import time from '../utils/Time';

import Bind from '../../decorators/Bind';

var backgroundRequestFrame = function(callback) {
    setTimeout(callback, 0);
};
var nativeRequestFrame = Global.requestAnimationFrame || Global.webkitRequestAnimationFrame || Global.mozRequestAnimationFrame || backgroundRequestFrame;
var defaultRequestFrame = nativeRequestFrame;

const maxFrameTime = process.env.RAF_TIME || 16;

/** @private */
export var rAFrames = [];

class RequestAnimationFrame extends BaseTaskQueue {

    tickTime = time();

    get background() {
        return defaultRequestFrame === backgroundRequestFrame;
    }

    set background(backgroundFrame) {
        defaultRequestFrame = backgroundFrame ? backgroundRequestFrame : nativeRequestFrame;
    }

    register() {
        /*
         * Fix for #269: MS Edge can throw "Invalid Calling Object" when using aliased rAF
         *
         * Why not just write the following as `defaultRequestFrame(this.run)`? Because MS Edge
         * throws `Invalid Calling Object`. Other projects have run into this and similar
         * issues, and the fix is to use `call` or `bind` so that we can be explicit about
         * what `this` should be. See links for more info.
         *
         * * https://github.com/vuejs/vue/issues/4465
         * * https://github.com/jquense/react-widgets/issues/91
         * * https://github.com/fisshy/react-scroll/issues/55
         */
        defaultRequestFrame.call(Global, this.run);
    }

    request(callback) {
        /* see comment in #register for why we have to call rAF this way -- hint: it's for Edge. */
        defaultRequestFrame.call(Global, callback);
    }

    wrapAll(context, ...rest) {
        rest.forEach((name) => context[name] = this.wrap(context[name].bind(context)));
    }

    wrap(fn) {
        return () => this.push(fn);
    }

    tick() {
        // Some platforms would not have a proper requestAnimationFrame. In that case
        // we will just use this simple tick to check if we are ready to run a new frame.
        let delta = time() - this.tickTime;
        if (delta >= 5) {
            this.run();
        }
    }

    @Bind
    run() {
        let startTime = this.tickTime = time();

        var endTime, delta;
        // console.group("rAF");

        // Workaround for MSEdge: Calling super.run() directly will make at least one of the
        // calls to super.run() to fail and stop the rAF from executing anymore. For that
        // reason we need to save the function on the stack and call it separately, most probably
        // some sort of JIT issue in MSEdge.
        var parentRun = super.run;
        parentRun.call(this);

        if (process.env.NODE_ENV !== 'production') {
            endTime = time();
            delta = endTime - startTime;
            rAFrames.unshift(delta);
            rAFrames.splice(10, rAFrames.length);
            if (delta > maxFrameTime) {
                console.warn('Long rAF frame-time', delta);
            }
        }

        // console.groupEnd("rAF");
    }

}

export default new RequestAnimationFrame;
