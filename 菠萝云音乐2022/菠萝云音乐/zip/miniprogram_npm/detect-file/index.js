module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1646378070240, function(require, module, exports) {
/*!
 * detect-file <https://github.com/doowb/detect-file>
 *
 * Copyright (c) 2016-2017, Brian Woodward.
 * Released under the MIT License.
 */



var fs = require('fs');
var path = require('path');

/**
 * Detect the given `filepath` if it exists.
 *
 * ```js
 * var res = detect('package.json');
 * console.log(res);
 * //=> "package.json"
 *
 * var res = detect('fake-file.json');
 * console.log(res)
 * //=> null
 * ```
 *
 * @param  {String} `filepath` filepath to detect.
 * @param  {Object} `options` Additional options.
 * @param  {Boolean} `options.nocase` Set this to `true` to force case-insensitive filename checks. This is useful on case sensitive file systems.
 * @return {String} Returns the detected filepath if it exists, otherwise returns `null`.
 * @api public
 */

module.exports = function detect(filepath, options) {
  if (!filepath || (typeof filepath !== 'string')) {
    return null;
  }
  if (fs.existsSync(filepath)) {
    return path.resolve(filepath);
  }

  options = options || {};
  if (options.nocase === true) {
    return nocase(filepath);
  }
  return null;
};

/**
 * Check if the filepath exists by falling back to reading in the entire directory.
 * Returns the real filepath (for case sensitive file systems) if found.
 *
 * @param  {String} `filepath` filepath to check.
 * @return {String} Returns found filepath if exists, otherwise null.
 */

function nocase(filepath) {
  filepath = path.resolve(filepath);
  var res = tryReaddir(filepath);
  if (res === null) {
    return null;
  }

  // "filepath" is a directory, an error would be
  // thrown if it doesn't exist. if we're here, it exists
  if (res.path === filepath) {
    return res.path;
  }

  // "filepath" is not a directory
  // compare against upper case later
  // see https://nodejs.org/en/docs/guides/working-with-different-filesystems/
  var upper = filepath.toUpperCase();
  var len = res.files.length;
  var idx = -1;

  while (++idx < len) {
    var fp = path.resolve(res.path, res.files[idx]);
    if (filepath === fp || upper === fp) {
      return fp;
    }
    var fpUpper = fp.toUpperCase();
    if (filepath === fpUpper || upper === fpUpper) {
      return fp;
    }
  }

  return null;
}

/**
 * Try to read the filepath as a directory first, then fallback to the filepath's dirname.
 *
 * @param  {String} `filepath` path of the directory to read.
 * @return {Object} Object containing `path` and `files` if succesful. Otherwise, null.
 */

function tryReaddir(filepath) {
  var ctx = { path: filepath, files: [] };
  try {
    ctx.files = fs.readdirSync(filepath);
    return ctx;
  } catch (err) {}
  try {
    ctx.path = path.dirname(filepath);
    ctx.files = fs.readdirSync(ctx.path);
    return ctx;
  } catch (err) {}
  return null;
}

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1646378070240);
})()
//miniprogram-npm-outsideDeps=["fs","path"]
//# sourceMappingURL=index.js.map