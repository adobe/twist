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

import BaseStore from '../BaseStore';
import DecoratorUtils from '../internal/utils/DecoratorUtils';

export default DecoratorUtils.makePropertyDecorator((target, property, descriptor, options = {}) => {
    if (typeof descriptor.value !== 'function') {
        throw new Error('@Action can only be used with a method (the handler for the action)');
    }

    if (!(target instanceof BaseStore)) {
        throw new Error('@Action can only be used for methods on a Store');
    }

    // Make sure you don't use reserved characters in an action name
    if (property.indexOf('/') !== -1) {
        throw new Error('@Action name can\'t include the "/" character');
    }
    if (property.indexOf('@') !== -1) {
        throw new Error('@Action name can\'t include the "@" character');
    }

    // Note: right now the actions have the same name as the method, but we could support an alias
    target.__actionHandlers = target.__actionHandlers || {};
    target.__actionHandlers[property] = {
        name: property,
        options
    };
}, {
    throwOnClassInvocation: '@Action must be used on a method, not a class.'
});
