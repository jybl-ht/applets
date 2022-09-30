module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1646378070176, function(require, module, exports) {


var domain = require('domain');

var eos = require('end-of-stream');
var p = require('process-nextick-args');
var once = require('once');
var exhaust = require('stream-exhaust');

var eosConfig = {
  error: false,
};

function rethrowAsync(err) {
  process.nextTick(rethrow);

  function rethrow() {
    throw err;
  }
}

function tryCatch(fn, args) {
  try {
    return fn.apply(null, args);
  } catch (err) {
    rethrowAsync(err);
  }
}

function asyncDone(fn, cb) {
  cb = once(cb);

  var d = domain.create();
  d.once('error', onError);
  var domainBoundFn = d.bind(fn);

  function done() {
    d.removeListener('error', onError);
    d.exit();
    return tryCatch(cb, arguments);
  }

  function onSuccess(result) {
    done(null, result);
  }

  function onError(error) {
    if (!error) {
      error = new Error('Promise rejected without Error');
    }
    done(error);
  }

  function asyncRunner() {
    var result = domainBoundFn(done);

    function onNext(state) {
      onNext.state = state;
    }

    function onCompleted() {
      onSuccess(onNext.state);
    }

    if (result && typeof result.on === 'function') {
      // Assume node stream
      d.add(result);
      eos(exhaust(result), eosConfig, done);
      return;
    }

    if (result && typeof result.subscribe === 'function') {
      // Assume RxJS observable
      result.subscribe(onNext, onError, onCompleted);
      return;
    }

    if (result && typeof result.then === 'function') {
      // Assume promise
      result.then(onSuccess, onError);
      return;
    }
  }

  p.nextTick(asyncRunner);
}

module.exports = asyncDone;

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1646378070176);
})()
//miniprogram-npm-outsideDeps=["domain","end-of-stream","process-nextick-args","once","stream-exhaust"]
//# sourceMappingURL=index.js.map