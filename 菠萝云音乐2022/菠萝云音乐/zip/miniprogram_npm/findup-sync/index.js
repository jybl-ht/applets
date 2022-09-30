module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1646378070642, function(require, module, exports) {


/**
 * Module dependencies
 */

var fs = require('fs');
var path = require('path');
var isGlob = require('is-glob');
var resolveDir = require('resolve-dir');
var detect = require('detect-file');
var mm = require('micromatch');

/**
 * @param  {String|Array} `pattern` Glob pattern or file path(s) to match against.
 * @param  {Object} `options` Options to pass to [micromatch]. Note that if you want to start in a different directory than the current working directory, specify the `options.cwd` property here.
 * @return {String} Returns the first matching file.
 * @api public
 */

module.exports = function(patterns, options) {
  options = options || {};
  var cwd = path.resolve(resolveDir(options.cwd || ''));

  if (typeof patterns === 'string') {
    return lookup(cwd, [patterns], options);
  }

  if (!Array.isArray(patterns)) {
    throw new TypeError('findup-sync expects a string or array as the first argument.');
  }

  return lookup(cwd, patterns, options);
};

function lookup(cwd, patterns, options) {
  var len = patterns.length;
  var idx = -1;
  var res;

  while (++idx < len) {
    if (isGlob(patterns[idx])) {
      res = matchFile(cwd, patterns[idx], options);
    } else {
      res = findFile(cwd, patterns[idx], options);
    }
    if (res) {
      return res;
    }
  }

  var dir = path.dirname(cwd);
  if (dir === cwd) {
    return null;
  }
  return lookup(dir, patterns, options);
}

function matchFile(cwd, pattern, opts) {
  var isMatch = mm.matcher(pattern, opts);
  var files = tryReaddirSync(cwd);
  var len = files.length;
  var idx = -1;

  while (++idx < len) {
    var name = files[idx];
    var fp = path.join(cwd, name);
    if (isMatch(name) || isMatch(fp)) {
      return fp;
    }
  }
  return null;
}

function findFile(cwd, filename, options) {
  var fp = cwd ? path.resolve(cwd, filename) : filename;
  return detect(fp, options);
}

function tryReaddirSync(fp) {
  try {
    return fs.readdirSync(fp);
  } catch (err) {
    // Ignore error
  }
  return [];
}

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1646378070642);
})()
//miniprogram-npm-outsideDeps=["fs","path","is-glob","resolve-dir","detect-file","micromatch"]
//# sourceMappingURL=index.js.map