/*

Copyright (c) 2014-2015 Sebastian McKenzie <sebmck@gmail.com>

MIT License

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

'use strict';

// This file is overwriting babel-runtime/helpers/inherits in order to add support for IE10.
// __proto__ is not available in IE10, so we are just copying the properties in order to support it.

var _Object$create = require('babel-runtime/core-js/object/create')['default'];

var _Object$setPrototypeOf = require('babel-runtime/core-js/object/set-prototype-of')['default'];

var _defaults = require('babel-runtime/helpers/defaults')['default'];

exports['default'] = (function() {
    // For IE10 that is not supporting __proto__ we have to assign all the properties from the base class.
    function _defineProto(subClass, superClass) {
        _defaults(subClass, superClass);
        subClass.__proto__ = superClass;
    }

    return function(subClass, superClass) {
        if (typeof superClass !== 'function' && superClass !== null) {
            throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
        }

        subClass.prototype = _Object$create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) {
            _Object$setPrototypeOf ? _Object$setPrototypeOf(subClass, superClass) : _defineProto(subClass, superClass);
        }
    };
})();

exports.__esModule = true;
