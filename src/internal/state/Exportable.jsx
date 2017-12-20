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

import SignalDispatcher from '../../SignalDispatcher';
import JSONProperties from './JSONProperties';

export default class Exportable extends SignalDispatcher {

    toJSON(includeDefaults = false) {
        if (!this.exportables) {
            return {};
        }
        return this.exportables.toJSON(this, includeDefaults);
    }

    fromJSON(json) {
        if (!this.exportables) {
            return this;
        }
        return this.exportables.fromJSON(this, json);
    }

}

Exportable.prototype.properties = new JSONProperties;
