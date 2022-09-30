module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1646378070644, function(require, module, exports) {


var fs = require('fs');
var path = require('path');

var isPlainObject = require('is-plain-object');
var pick = require('object.pick');
var defaults = require('object.defaults/immutable');
var expandTilde = require('expand-tilde');
var parsePath = require('parse-filepath');


function fined(pathObj, defaultObj) {
  var expandedPath = expandPath(pathObj, defaultObj);
  return expandedPath ? findWithExpandedPath(expandedPath) : null;
}

function expandPath(pathObj, defaultObj) {
  if (!isPlainObject(defaultObj)) {
    defaultObj = {};
  }

  if (isString(pathObj)) {
    pathObj = { path: pathObj };
  }

  if (!isPlainObject(pathObj)) {
    pathObj = {};
  }

  pathObj = defaults(pathObj, defaultObj);

  var filePath;
  if (!isString(pathObj.path)) {
    return null;
  }
  // Execution of toString is for a String object.
  if (isString(pathObj.name) && pathObj.name) {
    if (pathObj.path) {
      filePath = expandTilde(pathObj.path.toString());
      filePath = path.join(filePath, pathObj.name.toString());
    } else {
      filePath = pathObj.name.toString();
    }
  } else {
    filePath = expandTilde(pathObj.path.toString());
  }

  var extArr = createExtensionArray(pathObj.extensions);
  var extMap = createExtensionMap(pathObj.extensions);

  var basedir = isString(pathObj.cwd) ? pathObj.cwd.toString() : '.';
  basedir = path.resolve(expandTilde(basedir));

  var findUp = !!pathObj.findUp;

  var parsed = parsePath(filePath);
  if (parsed.isAbsolute) {
    filePath = filePath.slice(parsed.root.length);
    findUp = false;
    basedir = parsed.root;
  /* istanbul ignore if */
  } else if (parsed.root) { // Expanded path has a drive letter on Windows.
    filePath = filePath.slice(parsed.root.length);
    basedir = path.resolve(parsed.root);
  }

  if (parsed.ext) {
    filePath = filePath.slice(0, -parsed.ext.length);
    // This ensures that only the original extension is matched.
    extArr = [parsed.ext];
  }

  return {
    path: filePath,
    basedir: basedir,
    findUp: findUp,
    extArr: extArr,
    extMap: extMap,
  };
}

function findWithExpandedPath(expanded) {
  var found = expanded.findUp ?
    findUpFile(expanded.basedir, expanded.path, expanded.extArr) :
    findFile(expanded.basedir, expanded.path, expanded.extArr);

  if (!found) {
    return null;
  }

  if (expanded.extMap) {
    found.extension = pick(expanded.extMap, found.extension);
  }
  return found;
}

function findFile(basedir, relpath, extArr) {
  var noExtPath = path.resolve(basedir, relpath);
  for (var i = 0, n = extArr.length; i < n; i++) {
    var filepath = noExtPath + extArr[i];
    try {
      fs.statSync(filepath);
      return { path: filepath, extension: extArr[i] };
    } catch (e) {
      // Ignore error
    }
  }

  return null;
}

function findUpFile(basedir, filepath, extArr) {
  var lastdir;
  do {
    var found = findFile(basedir, filepath, extArr);
    if (found) {
      return found;
    }

    lastdir = basedir;
    basedir = path.dirname(basedir);
  } while (lastdir !== basedir);

  return null;
}

function createExtensionArray(exts) {
  if (isString(exts)) {
    return [exts];
  }

  if (Array.isArray(exts)) {
    exts = exts.filter(isString);
    return (exts.length > 0) ? exts : [''];
  }

  if (isPlainObject(exts)) {
    exts = Object.keys(exts);
    return (exts.length > 0) ? exts : [''];
  }

  return [''];
}

function createExtensionMap(exts) {
  if (!isPlainObject(exts)) {
    return null;
  }

  if (isEmpty(exts)) {
    return { '': null };
  }

  return exts;
}

function isEmpty(object) {
  return !Object.keys(object).length;
}

function isString(value) {
  if (typeof value === 'string') {
    return true;
  }

  if (Object.prototype.toString.call(value) === '[object String]') {
    return true;
  }

  return false;
}

module.exports = fined;

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1646378070644);
})()
//miniprogram-npm-outsideDeps=["fs","path","is-plain-object","object.pick","object.defaults/immutable","expand-tilde","parse-filepath"]
//# sourceMappingURL=index.js.map