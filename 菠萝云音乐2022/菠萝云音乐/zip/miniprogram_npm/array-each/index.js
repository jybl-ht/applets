module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1646378070167, function(require, module, exports) {
/*!
 * array-each <https://github.com/jonschlinkert/array-each>
 *
 * Copyright (c) 2015, 2017, Jon Schlinkert.
 * Released under the MIT License.
 */



/**
 * Loop over each item in an array and call the given function on every element.
 *
 * ```js
 * each(['a', 'b', 'c'], function(ele) {
 *   return ele + ele;
 * });
 * //=> ['aa', 'bb', 'cc']
 *
 * each(['a', 'b', 'c'], function(ele, i) {
 *   return i + ele;
 * });
 * //=> ['0a', '1b', '2c']
 * ```
 *
 * @name each
 * @alias forEach
 * @param {Array} `array`
 * @param {Function} `fn`
 * @param {Object} `thisArg` (optional) pass a `thisArg` to be used as the context in which to call the function.
 * @return {undefined}
 * @api public
 */

module.exports = function each(arr, cb, thisArg) {
  if (arr == null) return;

  var len = arr.length;
  var idx = -1;

  while (++idx < len) {
    var ele = arr[idx];
    if (cb.call(thisArg, ele, idx, arr) === false) {
      break;
    }
  }
};

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1646378070167);
})()
//miniprogram-npm-outsideDeps=[]
//# sourceMappingURL=index.js.map