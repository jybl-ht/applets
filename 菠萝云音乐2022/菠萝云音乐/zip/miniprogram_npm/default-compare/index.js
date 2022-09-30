module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1646378070235, function(require, module, exports) {


var typeOf = require('kind-of');

/**
 * Basic sort algorithm that has similar behavior to `Array.prototype.sort`
 * for null and undefined, but also allows sorting by an object property.
 *
 * @param {Mixed} `a` First value to compare.
 * @param {Mixed} `b` Second value to compare.
 * @param {String} `prop` Optional property to use when comparing objects. If specified must be a string.
 * @return {Number} Returns 1 when `a` should come after `b`, -1 when `a` should come before `b`, and 0 when `a` and `b` are equal.
 * @api public
 */

module.exports = function defaultCompare(a, b, prop) {
  if (prop != null && typeOf(prop) !== 'string') {
    throw new TypeError('expected "prop" to be undefined or a string');
  }

  var typeA = typeOf(a);
  var typeB = typeOf(b);

  if (prop) {
    if (typeA === 'object') {
      a = a[prop];
      typeA = typeOf(a);
    }
    if (typeB === 'object') {
      b = b[prop];
      typeB = typeOf(b);
    }
  }

  if (typeA === 'null') {
    return typeB === 'null' ? 0 : (typeB === 'undefined' ? -1 : 1);
  } else if (typeA === 'undefined') {
    return typeB === 'null' ? 1 : (typeB === 'undefined' ? 0 : 1);
  } else if (typeB === 'null' || typeB === 'undefined') {
    return -1;
  } else {
    return a < b ? -1 : (a > b ? 1 : 0);
  }
};

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1646378070235);
})()
//miniprogram-npm-outsideDeps=["kind-of"]
//# sourceMappingURL=index.js.map