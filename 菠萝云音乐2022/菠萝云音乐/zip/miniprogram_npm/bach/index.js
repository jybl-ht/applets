module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1646378070180, function(require, module, exports) {


module.exports = {
  series: require('./lib/series'),
  parallel: require('./lib/parallel'),
  settleSeries: require('./lib/settleSeries'),
  settleParallel: require('./lib/settleParallel'),
};

}, function(modId) {var map = {"./lib/series":1646378070181,"./lib/parallel":1646378070183,"./lib/settleSeries":1646378070184,"./lib/settleParallel":1646378070185}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070181, function(require, module, exports) {


var initial = require('array-initial');
var last = require('array-last');
var asyncDone = require('async-done');
var nowAndLater = require('now-and-later');

var helpers = require('./helpers');

function iterator(fn, key, cb) {
  return asyncDone(fn, cb);
}

function buildSeries() {
  var args = helpers.verifyArguments(arguments);

  var extensions = helpers.getExtensions(last(args));

  if (extensions) {
    args = initial(args);
  }

  function series(done) {
    nowAndLater.mapSeries(args, iterator, extensions, done);
  }

  return series;
}

module.exports = buildSeries;

}, function(modId) { var map = {"./helpers":1646378070182}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070182, function(require, module, exports) {


var assert = require('assert');

var filter = require('arr-filter');
var map = require('arr-map');
var flatten = require('arr-flatten');
var forEach = require('array-each');

function noop() {}

function getExtensions(lastArg) {
  if (typeof lastArg !== 'function') {
    return lastArg;
  }
}

function filterSuccess(elem) {
  return elem.state === 'success';
}

function filterError(elem) {
  return elem.state === 'error';
}

function buildOnSettled(done) {
  if (typeof done !== 'function') {
    done = noop;
  }

  function onSettled(error, result) {
    if (error) {
      return done(error, null);
    }

    var settledErrors = filter(result, filterError);
    var settledResults = filter(result, filterSuccess);

    var errors = null;
    if (settledErrors.length) {
      errors = map(settledErrors, 'value');
    }

    var results = null;
    if (settledResults.length) {
      results = map(settledResults, 'value');
    }

    done(errors, results);
  }

  return onSettled;
}

function verifyArguments(args) {
  args = flatten(args);
  var lastIdx = args.length - 1;

  assert.ok(args.length, 'A set of functions to combine is required');

  forEach(args, function(arg, argIdx) {
    var isFunction = typeof arg === 'function';
    if (isFunction) {
      return;
    }

    if (argIdx === lastIdx) {
      // Last arg can be an object of extension points
      return;
    }

    var msg = 'Only functions can be combined, got ' + typeof arg +
      ' for argument ' + argIdx;
    assert.ok(isFunction, msg);
  });

  return args;
}

module.exports = {
  getExtensions: getExtensions,
  onSettled: buildOnSettled,
  verifyArguments: verifyArguments,
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070183, function(require, module, exports) {


var initial = require('array-initial');
var last = require('array-last');
var asyncDone = require('async-done');
var nowAndLater = require('now-and-later');

var helpers = require('./helpers');

function iterator(fn, key, cb) {
  return asyncDone(fn, cb);
}

function buildParallel() {
  var args = helpers.verifyArguments(arguments);

  var extensions = helpers.getExtensions(last(args));

  if (extensions) {
    args = initial(args);
  }

  function parallel(done) {
    nowAndLater.map(args, iterator, extensions, done);
  }

  return parallel;
}

module.exports = buildParallel;

}, function(modId) { var map = {"./helpers":1646378070182}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070184, function(require, module, exports) {


var initial = require('array-initial');
var last = require('array-last');
var asyncSettle = require('async-settle');
var nowAndLater = require('now-and-later');

var helpers = require('./helpers');

function iterator(fn, key, cb) {
  return asyncSettle(fn, cb);
}

function buildSettleSeries() {
  var args = helpers.verifyArguments(arguments);

  var extensions = helpers.getExtensions(last(args));

  if (extensions) {
    args = initial(args);
  }

  function settleSeries(done) {
    var onSettled = helpers.onSettled(done);
    nowAndLater.mapSeries(args, iterator, extensions, onSettled);
  }

  return settleSeries;
}

module.exports = buildSettleSeries;

}, function(modId) { var map = {"./helpers":1646378070182}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070185, function(require, module, exports) {


var initial = require('array-initial');
var last = require('array-last');
var asyncSettle = require('async-settle');
var nowAndLater = require('now-and-later');

var helpers = require('./helpers');

function iterator(fn, key, cb) {
  return asyncSettle(fn, cb);
}

function buildSettleParallel() {
  var args = helpers.verifyArguments(arguments);

  var extensions = helpers.getExtensions(last(args));

  if (extensions) {
    args = initial(args);
  }

  function settleParallel(done) {
    var onSettled = helpers.onSettled(done);
    nowAndLater.map(args, iterator, extensions, onSettled);
  }

  return settleParallel;
}

module.exports = buildSettleParallel;

}, function(modId) { var map = {"./helpers":1646378070182}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1646378070180);
})()
//miniprogram-npm-outsideDeps=["array-initial","array-last","async-done","now-and-later","assert","arr-filter","arr-map","arr-flatten","array-each","async-settle"]
//# sourceMappingURL=index.js.map