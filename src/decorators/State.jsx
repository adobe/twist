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
    @State.xxx decorators - these are used inside an @Store to specify how to serialize/deserialize
    the properties of the store to/from JSON. The decorators ensure that modifications to the properties
    only happen inside of an action handler.
**/

import StateObservableArray from '../internal/state/StateObservableArray';
import StateObservableMap from '../internal/state/StateObservableMap';
import JSONProperties from '../internal/state/JSONProperties';
import DecoratorUtils from '../internal/utils/DecoratorUtils';
import { shallowClone } from '../third_party/clone.jsx';

function toBoolean(str) {
    // Special case so that 'false' is treated as false, not true.
    return str === 'false' ? false : Boolean(str);
}

function identity(a) {
    return a;
}

function slice(a) {
    if (a && a.toArray) {
        // ObservableArray case
        return a.toArray();
    }
    return a && a.slice && a.slice();
}

function wrapArray(array, parent, name) {
    var observableArray = new StateObservableArray(array);
    observableArray._parent = parent;
    observableArray._name = name;
    observableArray._linkItems();
    return observableArray;
}

function wrapMap(map, parent, name) {
    var observableMap = new StateObservableMap(map);
    observableMap._parent = parent;
    observableMap._name = name;
    observableMap._linkItems();
    return observableMap;
}

function exportables(obj) {
    // Inherit the JSON properties from the parent.
    if (!obj.hasOwnProperty('exportables')) {
        obj.exportables = new JSONProperties(obj);
    }
    return obj.exportables;
}

/**
    The @State.xxx decorators.
**/
class State {

    /**
        Value types
    **/

    @DecoratorUtils.wrapPropertyDecorator
    byVal(target, property, descriptor, config = null) {
        return exportables(target).add(property, shallowClone, shallowClone, DecoratorUtils.getInitialValue(descriptor), config);
    }

    @DecoratorUtils.wrapPropertyDecorator
    byBooleanVal(target, property, descriptor, config = null) {
        return exportables(target).add(property, toBoolean, Boolean, DecoratorUtils.getInitialValue(descriptor), config);
    }

    @DecoratorUtils.wrapPropertyDecorator
    byNumberVal(target, property, descriptor, config = null) {
        return exportables(target).add(property, Number, Number, DecoratorUtils.getInitialValue(descriptor), config);
    }

    @DecoratorUtils.wrapPropertyDecorator
    bySimpleVal(target, property, descriptor, config = null) {
        return exportables(target).add(property, identity, identity, DecoratorUtils.getInitialValue(descriptor), config);
    }

    @DecoratorUtils.wrapPropertyDecorator
    byCustomVal(target, property, descriptor, type, defaultValue) {
        return exportables(target).add(property,
            function(jsonValue) {
                return type.parse(jsonValue !== undefined ? jsonValue : defaultValue, this, property);
            },
            function(objValue) {
                return type.serialize(objValue, this, property);
            },
            DecoratorUtils.getInitialValue(descriptor)
        );
    }


    /**
        Reference types
    **/

    @DecoratorUtils.wrapPropertyDecorator
    byRef(target, property, descriptor, RefType) {
        return exportables(target).add(property,
            (jsonValue) => {
                var value = new RefType();
                value.fromJSON(jsonValue || {});
                return value;
            },
            (objValue, includeDefaults) => objValue ? objValue.toJSON(includeDefaults) : null,
            DecoratorUtils.getInitialValue(descriptor)
        );
    }

    @DecoratorUtils.wrapPropertyDecorator
    byOptionalRef(target, property, descriptor, RefType) {
        return exportables(target).add(property,
            (jsonValue) => {
                if (!jsonValue) {
                    return null;
                }

                var value = new RefType();
                value.fromJSON(jsonValue);
                return value;
            },
            (objValue, includeDefaults) => objValue ? objValue.toJSON(includeDefaults) : null,
            DecoratorUtils.getInitialValue(descriptor)
        );
    }

    @DecoratorUtils.wrapPropertyDecorator
    byCustomRef(target, property, descriptor, typeFn) {
        return exportables(target).add(property,
            function(jsonValue) {
                var Ref = typeFn(jsonValue, this);
                if (!Ref) {
                    return null;
                }
                var value = typeof Ref === 'function' ? new Ref() : Ref;
                if (jsonValue) {
                    value.fromJSON(jsonValue);
                }
                return value;
            },
            (objValue, includeDefaults) => objValue ? objValue.toJSON(includeDefaults) : null,
            DecoratorUtils.getInitialValue(descriptor)
        );
    }


    /**
        Array Types
    **/

    @DecoratorUtils.wrapPropertyDecorator
    byArray(target, property, descriptor, isStatic) {
        return exportables(target).add(property,
            function(jsonValue) {
                var result = slice(jsonValue) || [];
                return isStatic ? result : wrapArray(result, this, property);
            },
            slice,
            DecoratorUtils.getInitialValue(descriptor)
        );
    }

    @DecoratorUtils.wrapPropertyDecorator
    byRefArray(target, property, descriptor, RefType, isStatic) {
        return exportables(target).add(property,
            function(jsonValue) {
                var result = [];
                if (jsonValue && (jsonValue instanceof Array)) {
                    for (var i = 0, l = jsonValue.length; i < l; ++i) {
                        var value = new RefType();
                        value.fromJSON(jsonValue[i] || {});
                        result.push(value);
                    }
                }
                return isStatic ? result : wrapArray(result, this, property);
            },
            (objValue, includeDefaults) => {
                var array = objValue ? objValue.map((objValue) => (objValue ? objValue.toJSON(includeDefaults) : null)) : [];
                return array.base || array;
            },
            DecoratorUtils.getInitialValue(descriptor)
        );
    }


    @DecoratorUtils.wrapPropertyDecorator
    byCustomRefArray(target, property, descriptor, typeFn, isStatic) {
        return exportables(target).add(property,
            function(jsonValue) {
                var result = [];
                if (jsonValue && jsonValue.length) {
                    for (var i = 0, l = jsonValue.length; i < l; ++i) {
                        var itemJsonValue = jsonValue[i];
                        var Ref = typeFn(itemJsonValue, this);
                        if (Ref) {
                            var value = typeof Ref === 'function' ? new Ref() : Ref;
                            if (itemJsonValue) {
                                value.fromJSON(itemJsonValue);
                            }
                            result.push(value);
                        }
                    }
                }
                return isStatic ? result : wrapArray(result, this, property);
            },
            (objValue, includeDefaults) => {
                var array = objValue ? objValue.map((objValue) => (objValue ? objValue.toJSON(includeDefaults) : null)) : [];
                return array.base || array;
            },
            DecoratorUtils.getInitialValue(descriptor)
        );

    }


    /**
        Map Types
    **/

    @DecoratorUtils.wrapPropertyDecorator
    byMap(target, property, descriptor, isStatic) {
        return exportables(target).add(property,
            function(jsonValue) {
                let result = Object.assign({}, jsonValue);
                return isStatic ? result : wrapMap(result, this, property);
            },
            (objValue) => {
                let result = {};
                if (objValue instanceof StateObservableMap) {
                    for (let key of objValue.keys()) {
                        result[key] = objValue.get(key);
                    }
                }
                else if (objValue) {
                    Object.assign(result, objValue);
                }
                return result;
            },
            DecoratorUtils.getInitialValue(descriptor)
        );
    }


    @DecoratorUtils.wrapPropertyDecorator
    byRefMap(target, property, descriptor, RefType, isStatic) {
        return exportables(target).add(property,
            function(jsonValue) {
                let result = {};
                for (let key in jsonValue) {
                    let childValue = jsonValue[key];
                    let value = new RefType();
                    if (childValue) {
                        value.fromJSON(childValue);
                    }
                    result[key] = value;
                }
                return isStatic ? result : wrapMap(result, this, property);
            },
            (objValue, includeDefaults) => {
                let result = {};
                if (objValue instanceof StateObservableMap) {
                    for (let key of objValue.keys()) {
                        let value = objValue.get(key);
                        result[key] = value ? value.toJSON(includeDefaults) : null;
                    }
                }
                else if (objValue) {
                    for (let key in objValue) {
                        let value = objValue[key];
                        result[key] = value ? value.toJSON(includeDefaults) : null;
                    }
                }
                return result;
            },
            DecoratorUtils.getInitialValue(descriptor)
        );
    }


    /**
        Alias
    **/

    @DecoratorUtils.wrapPropertyDecorator
    alias(target, property, descriptor, jsonName) {
        exportables(target).alias(jsonName, property);
    }

}

// TODO: The above properties should be static, but that doesn't work right now with the @DecoratorUtils.wrapPropertyDecorator
export default new State;
