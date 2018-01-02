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

const browserslist = require('browserslist');

/**
 * @typedef {object} BrowsersListTargets
 * @property {string|array} [browsers] Browser comparison strings. See the docs for browserslist.
 * @property {string} [node] A node version to target, or 'current' to target the current version.
 * @property {'es5'|'es6'} [torqWebCompiler] If provided, indicates that we're targeting torq's web compiler.
 */

/**
 * Static utilities for analyzing a browserslist-style target object.
 */
module.exports = class TargetsMeta {
    /**
     * Compare each targeted browser from `targets` to `regex`, returning true if any
     * browser matches the regular expression.
     * @param {BrowsersListTargets} targets
     * @param {RegExp} regex
     * @return {boolean}
     */
    static testTargets(targets, regex) {
        const browserList = browserslist(targets && targets.browsers);
        for (let i = 0; i < browserList.length; i++) {
            if (regex.test(browserList[i])) {
                return true;
            }
        }
        return false;
    }

    /**
     * Return true if the given browser targets require polyfills for basic ES5 builtins
     * such as Map, Set, and Promise. The babel-runtime package provides a basic polyfill
     * for these globals (distinct from babel-polyfill, which is more extensive). If we're
     * not targeting any browsers that require these basic polyfills, we can avoid including
     * them. IE is the only major platform that still requires these polyfills.
     * @param {BrowsersListTargets} targets
     * @return {boolean}
     */
    static doTargetsRequireES5(targets) {
        if (targets && targets.torqWebCompiler === 'es6') {
            return false;
        }
        return TargetsMeta.testTargets(targets, /^(ie|op_mini)/);
    }

    /**
     * Return true if the given browser targets require transpiling `const` to `var`.
     * This includes IE <= 10, Safari <= 9, and Opera Mini.
     * @param {*} targets
     * @return {boolean}
     */
    static doTargetsRequireConstTransform(targets) {
        if (targets && targets.torqWebCompiler === 'es6') {
            return false;
        }
        return TargetsMeta.testTargets(targets, /^(ie (8|9|10)|op_mini|safari (8|9))/);
    }
};
