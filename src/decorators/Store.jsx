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

/**
    @Store is used to create a store. This encapsulates state, and can be used to load/save state.
    State can only be modified via actions, which are methods on a store, decorated with @Action
**/

import StoreSerializer from '../internal/state/StoreSerializer';
import DecoratorUtils from '../internal/utils/DecoratorUtils';

export default DecoratorUtils.makeClassDecorator((target, args) => {
    target.prototype.__allowMutable = args && args.mutable;
    StoreSerializer.register(target);
});
