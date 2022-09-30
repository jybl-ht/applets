module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1646378070243, function(require, module, exports) {


var isPlainObject = require('is-plain-object');
var defaults = require('object.defaults/immutable');

module.exports = function(obj, fn, opts) {
  if (!isObject(obj)) {
    return;
  }

  if (typeof fn !== 'function') {
    return;
  }

  if (!isPlainObject(opts)) {
    opts = {};
  }

  forEachChild(obj, '', fn, 0, opts);
};

function forEachChild(node, baseKey, fn, depth, opts) {
  var keys = Object.keys(node);
  if (typeof opts.sort === 'function') {
    var sortedKeys = opts.sort(keys);
    if (Array.isArray(sortedKeys)) {
      keys = sortedKeys;
    }
  }

  depth += 1;

  for (var i = 0, n = keys.length; i < n; i++) {
    var key = keys[i];
    var keyChain = baseKey + '.' + key;
    var value = node[key];

    var nodeInfo = defaults(opts);
    nodeInfo.name = key;
    nodeInfo.index = i;
    nodeInfo.count = n;
    nodeInfo.depth = depth;
    nodeInfo.parent = node;

    var notDigg = fn(value, keyChain.slice(1), nodeInfo);
    if (notDigg || !isPlainObject(value)) {
      continue;
    }

    forEachChild(value, keyChain, fn, depth, opts);
  }
}

function isObject(v) {
  return Object.prototype.toString.call(v) === '[object Object]';
}


}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1646378070243);
})()
//miniprogram-npm-outsideDeps=["is-plain-object","object.defaults/immutable"]
//# sourceMappingURL=index.js.map