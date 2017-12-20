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

import PromiseFilter from './PromiseFilter';

var filters = [ PromiseFilter ];
var filtersLength = 1;

export default {

    add(fn) {
        filters.push(fn);
        filtersLength = filters.length;
    },

    remove(fn) {
        var index = filters.indexOf(fn);
        if (index !== -1) {
            filters.splice(index, 1);
        }
        filtersLength = filters.length;
    },

    filter(bindings, value) {
        for (var i = 0, l = filtersLength; i < l; ++i) {
            var result = filters[i](bindings, value);
            if (result) {
                return result.value;
            }
        }
        return value;
    }

};
