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

module.exports = function(config) {
    return config
        .addDecorator('Abstract', {
            module: '@twist/core',
            export: 'Abstract'
        })
        .addDecorator('Action', {
            module: '@twist/core',
            export: 'Action'
        })
        .addDecorator('Bind', {
            module: '@twist/core',
            export: 'Bind'
        })
        .addDecorator('Cache', {
            module: '@twist/core',
            export: 'Cache'
        })
        .addDecorator('Debounce', {
            module: '@twist/core',
            export: 'Debounce'
        })
        .addDecorator('Delay', {
            module: '@twist/core',
            export: 'Delay'
        })
        .addDecorator('Memoize', {
            module: '@twist/core',
            export: 'Memoize'
        })
        .addDecorator('Observable', {
            module: '@twist/core',
            export: 'Observable'
        })
        .addDecorator('Prototype', {
            module: '@twist/core',
            export: 'Prototype'
        })
        .addDecorator('State', {
            module: '@twist/core',
            export: 'State'
        })
        .addDecorator('Store', {
            module: '@twist/core',
            export: 'Store',
            inherits: {
                module: '@twist/core',
                export: 'BaseStore'
            }
        })
        .addDecorator('Task', {
            module: '@twist/core',
            export: 'Task'
        })
        .addDecorator('Throttle', {
            module: '@twist/core',
            export: 'Throttle'
        })
        .addDecorator('Wrap', {
            module: '@twist/core',
            export: 'Wrap'
        });
};
