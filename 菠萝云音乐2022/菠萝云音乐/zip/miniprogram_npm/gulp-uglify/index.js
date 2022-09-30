module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1646378070697, function(require, module, exports) {

var uglify = require('uglify-js');
var compose = require('./composer');
var GulpUglifyError = require('./lib/gulp-uglify-error');
var logger = require('./lib/log');

module.exports = function(opts) {
  return compose(
    uglify,
    logger
  )(opts);
};

module.exports.GulpUglifyError = GulpUglifyError;

}, function(modId) {var map = {"./composer":1646378070698,"./lib/gulp-uglify-error":1646378070701,"./lib/log":1646378070702}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070698, function(require, module, exports) {

var through = require('through2');
var minify = require('./lib/minify');

module.exports = function(uglify, logger) {
  return function(opts) {
    var minifier = minify(uglify, logger)(opts);
    return through.obj(function(file, encoding, callback) {
      var newFile = null;
      var err = null;
      try {
        newFile = minifier(file);
      } catch (e) {
        err = e;
      }
      callback(err, newFile);
    });
  };
};

}, function(modId) { var map = {"./lib/minify":1646378070699}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070699, function(require, module, exports) {

var Buffer = require('safe-buffer').Buffer;
var applySourceMap = require('vinyl-sourcemaps-apply');
var isObject = require('isobject');
var extend = require('extend-shallow');
var createError = require('./create-error');

module.exports = function(uglify, log) {
  function setup(opts) {
    if (opts && !isObject(opts)) {
      log.warn('gulp-uglify expects an object, non-object provided');
      opts = {};
    }

    return extend(
      {},
      {
        output: {}
      },
      opts
    );
  }

  return function(opts) {
    return function(file) {
      var options = setup(opts || {});
      var hasSourceMaps = Boolean(file.sourceMap);

      if (file.isNull()) {
        return file;
      }

      if (file.isStream()) {
        throw createError(file, 'Streaming not supported', null);
      }

      if (hasSourceMaps) {
        options.sourceMap = {
          filename: file.sourceMap.file,
          includeSources: true
        };

        // UglifyJS generates broken source maps if the input source map
        // does not contain mappings.
        if (file.sourceMap.mappings) {
          options.sourceMap.content = file.sourceMap;
        }
      }

      var fileMap = {};
      fileMap[file.relative] = String(file.contents);

      var mangled = uglify.minify(fileMap, options);

      if (!mangled || mangled.error) {
        throw createError(
          file,
          'unable to minify JavaScript',
          mangled && mangled.error
        );
      }

      if (mangled.warnings) {
        mangled.warnings.forEach(function(warning) {
          log.warn('gulp-uglify [%s]: %s', file.relative, warning);
        });
      }

      file.contents = Buffer.from(mangled.code);

      if (hasSourceMaps) {
        var sourceMap = JSON.parse(mangled.map);
        applySourceMap(file, sourceMap);
      }

      return file;
    };
  };
};

}, function(modId) { var map = {"./create-error":1646378070700}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070700, function(require, module, exports) {

var GulpUglifyError = require('./gulp-uglify-error');

function createError(file, msg, cause) {
  var perr = new GulpUglifyError(msg, cause);
  perr.plugin = 'gulp-uglify';
  perr.fileName = file.path;
  perr.showStack = false;
  return perr;
}

module.exports = createError;

}, function(modId) { var map = {"./gulp-uglify-error":1646378070701}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070701, function(require, module, exports) {

var makeErrorCause = require('make-error-cause');

var gulpUglifyError = makeErrorCause('GulpUglifyError');
gulpUglifyError.prototype.toString = function() {
  var cause = this.cause || {};

  return (
    makeErrorCause.BaseError.prototype.toString.call(this) +
    (this.fileName ? '\nFile: ' + this.fileName : '') +
    (cause.line ? '\nLine: ' + cause.line : '') +
    (cause.col ? '\nCol: ' + cause.col : '')
  );
};

module.exports = gulpUglifyError;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070702, function(require, module, exports) {

var hasLog = require('has-gulplog');
var each = require('array-each');

var levels = ['debug', 'info', 'warn', 'error'];

each(levels, function(level) {
  module.exports[level] = function() {
    if (hasLog()) {
      var log = require('gulplog');

      log[level].apply(log, arguments);
    }
  };
});

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1646378070697);
})()
//miniprogram-npm-outsideDeps=["uglify-js","through2","safe-buffer","vinyl-sourcemaps-apply","isobject","extend-shallow","make-error-cause","has-gulplog","array-each","gulplog"]
//# sourceMappingURL=index.js.map