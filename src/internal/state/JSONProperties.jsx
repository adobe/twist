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

import ActionDispatcher from './ActionDispatcher';
import StoreSerializer from './StoreSerializer';
import Binder from '../../Binder';
import ObjectUtils from '../utils/ObjectUtils';
import { shallowClone } from '../../third_party/clone';

function fromJSONProperty(property, name, jsonName, obj, json) {
    var jsonValue = json && json[jsonName];
    var value = jsonValue !== undefined ? jsonValue : property.defaultValue;
    var newValue = property.fromJSON.call(obj, value);
    obj[name] = newValue;
}

export default class JSONProperties {

    constructor(prototype) {
        var parent = prototype && prototype.exportables;
        this.properties = parent ? shallowClone(parent.properties) : [];
        this.aliases = parent ? shallowClone(parent.aliases) : {};
        this.prototype = prototype;
    }

    alias(jsonName, propertyName) {
        var aliases = this.aliases;
        if (!aliases) {
            aliases = this.aliases = {};
        }
        aliases[propertyName] = jsonName;
    }

    getJsonName(name) {
        var aliases = this.aliases;
        if (!aliases) {
            return name;
        }
        return aliases.hasOwnProperty(name) ? aliases[name] : name;
    }

    add(name, fromJSON, toJSON, defaultValue, config) {
        var key = Symbol('state.' + name);
        this.properties.push({
            name,
            key,
            toJSON,
            fromJSON,
            defaultValue,
            config
        });
        return {
            enumerable: true,
            configurable: false,
            get() {
                Binder.active && Binder.recordEvent(this, name);
                return this[key];
            },
            set(value) {
                if (!ActionDispatcher.active) {
                    return StoreSerializer.ensureAction(this, name, value);
                }

                var oldValue = this[key];

                // No need to trigger an event when the value is not changed.
                if (oldValue === value) {
                    return;
                }

                this[key] = value;
                Binder.recordChange(this, name, value, oldValue);

                this._linkStore(name, value);
            }
        };
    }

    computeJSONMethod() {
        var funcs = [];
        var properties = this.properties;

        for (var i = 0, l = properties.length; i < l; ++i) {
            var property = properties[i];
            var name = (property.name);
            var jsonName = this.getJsonName(property.name);
            funcs.push(fromJSONProperty.bind(this, property, name, jsonName));
        }

        this.fromJSON = (obj, json) => {
            funcs.forEach((func) => func(obj, json));
            return obj;
        };
    }

    fromJSON(obj, json) {
        this.computeJSONMethod();
        return this.fromJSON(obj, json);
    }

    toJSON(obj, includeDefaults = false) {
        var json = {};
        var properties = this.properties;
        for (var i = 0, l = properties.length; i < l; ++i) {
            var property = properties[i];
            Binder.active && Binder.recordEvent(obj, property.name);
            var value = property.toJSON.call(obj, obj[property.key], includeDefaults);
            if (includeDefaults || !ObjectUtils.deepEqual(value, property.defaultValue)) {
                json[this.getJsonName(property.name)] = value;
            }
        }
        return json;
    }
}
