module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1646378070654, function(require, module, exports) {


var through = require('through2');

var mkdirp = require('./mkdirp');

function toFunction(dirpath) {
  function stringResolver(chunk, callback) {
    callback(null, dirpath);
  }

  return stringResolver;
}

function define(options) {

  function mkdirpStream(resolver) {
    // Handle resolver that's just a dirpath
    if (typeof resolver === 'string') {
      resolver = toFunction(resolver);
    }

    function makeFileDirs(chunk, enc, callback) {
      resolver(chunk, onDirpath);

      function onDirpath(dirpathErr, dirpath, mode) {
        if (dirpathErr) {
          return callback(dirpathErr);
        }

        mkdirp(dirpath, mode, onMkdirp);
      }

      function onMkdirp(mkdirpErr) {
        if (mkdirpErr) {
          return callback(mkdirpErr);
        }

        callback(null, chunk);
      }
    }

    return through(options, makeFileDirs);
  }

  return mkdirpStream;
}

module.exports = define();
module.exports.obj = define({ objectMode: true, highWaterMark: 16 });

}, function(modId) {var map = {"./mkdirp":1646378070655}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070655, function(require, module, exports) {


var path = require('path');

var fs = require('graceful-fs');

var MASK_MODE = parseInt('7777', 8);
var DEFAULT_DIR_MODE = parseInt('0777', 8);

function mkdirp(dirpath, customMode, callback) {
  if (typeof customMode === 'function') {
    callback = customMode;
    customMode = undefined;
  }

  var mode = customMode || (DEFAULT_DIR_MODE & ~process.umask());
  dirpath = path.resolve(dirpath);

  fs.mkdir(dirpath, mode, onMkdir);

  function onMkdir(mkdirErr) {
    if (!mkdirErr) {
      return fs.stat(dirpath, onStat);
    }

    switch (mkdirErr.code) {
      case 'ENOENT': {
        return mkdirp(path.dirname(dirpath), onRecurse);
      }

      case 'EEXIST': {
        return fs.stat(dirpath, onStat);
      }

      default: {
        return callback(mkdirErr);
      }
    }

    function onStat(statErr, stats) {
      if (statErr) {
        return callback(statErr);
      }

      if (!stats.isDirectory()) {
        return callback(mkdirErr);
      }

      // TODO: Is it proper to mask like this?
      if ((stats.mode & MASK_MODE) === mode) {
        return callback();
      }

      if (!customMode) {
        return callback();
      }

      fs.chmod(dirpath, mode, callback);
    }
  }

  function onRecurse(recurseErr) {
    if (recurseErr) {
      return callback(recurseErr);
    }

    mkdirp(dirpath, mode, callback);
  }
}

module.exports = mkdirp;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1646378070654);
})()
//miniprogram-npm-outsideDeps=["through2","path","graceful-fs"]
//# sourceMappingURL=index.js.map