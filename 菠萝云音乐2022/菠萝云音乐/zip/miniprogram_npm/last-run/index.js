module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1646378070756, function(require, module, exports) {


var assert = require('assert');

var WM = require('es6-weak-map');
var hasNativeWeakMap = require('es6-weak-map/is-native-implemented');
var defaultResolution = require('default-resolution');

var runtimes = new WM();

function isFunction(fn) {
  return (typeof fn === 'function');
}

function isExtensible(fn) {
  if (hasNativeWeakMap) {
    // Native weakmap doesn't care about extensible
    return true;
  }

  return Object.isExtensible(fn);
}

function lastRun(fn, timeResolution) {
  assert(isFunction(fn), 'Only functions can check lastRun');
  assert(isExtensible(fn), 'Only extensible functions can check lastRun');

  var time = runtimes.get(fn);

  if (time == null) {
    return;
  }

  var resolution = defaultResolution(timeResolution);

  return time - (time % resolution);
}

function capture(fn, timestamp) {
  assert(isFunction(fn), 'Only functions can be captured');
  assert(isExtensible(fn), 'Only extensible functions can be captured');

  timestamp = timestamp || Date.now();

  runtimes.set(fn, timestamp);
}

function release(fn) {
  assert(isFunction(fn), 'Only functions can be captured');
  assert(isExtensible(fn), 'Only extensible functions can be captured');

  runtimes.delete(fn);
}

lastRun.capture = capture;
lastRun.release = release;

module.exports = lastRun;

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1646378070756);
})()
//miniprogram-npm-outsideDeps=["assert","es6-weak-map","es6-weak-map/is-native-implemented","default-resolution"]
//# sourceMappingURL=index.js.map