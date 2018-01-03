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

module.exports = function(config, options) {

    // For testing:
    config.numAdded = config.numAdded || 0;
    config.numAdded++;
    config.passedOptions = options;

    return config
        .addDecorator('Store', {
            module: '@twist/core',
            export: 'Store',
            inherits: {
                module: '@twist/core',
                export: 'BaseStore'
            }
        })
        .addComponent('my:component', {
            module: '@twist/core',
            export: 'MyComponent'
        });
};
