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

var lastId = 0;
var propertyId = '__object_id__';

function SetObjectId(obj, id) {
    Object.defineProperty(obj, propertyId, {
        enumerable: false,
        configurable: false,
        writable: false,
        value: id
    });
}

function ObjectId(obj) {
    if (!obj || (typeof obj === 'number' || typeof obj === 'string')) {
        return obj;
    }

    if (!obj.hasOwnProperty(propertyId)) {
        var id = '_' + (++lastId);
        Object.defineProperty(obj, propertyId, {
            enumerable: false,
            configurable: false,
            writable: false,
            value: id
        });
        return id;
    }

    return obj[propertyId];
}

ObjectId.set = SetObjectId;

export default ObjectId;
