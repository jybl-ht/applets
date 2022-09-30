module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1646378070760, function(require, module, exports) {


var Writable = require('flush-write-stream');

function listenerCount(stream, evt) {
  return stream.listeners(evt).length;
}

function hasListeners(stream) {
  return !!(listenerCount(stream, 'readable') || listenerCount(stream, 'data'));
}

function sinker(file, enc, callback) {
  callback();
}

function sink(stream) {
  var sinkAdded = false;

  var sinkOptions = {
    objectMode: stream._readableState.objectMode,
  };

  var sinkStream = new Writable(sinkOptions, sinker);

  function addSink() {
    if (sinkAdded) {
      return;
    }

    if (hasListeners(stream)) {
      return;
    }

    sinkAdded = true;
    stream.pipe(sinkStream);
  }

  function removeSink(evt) {
    if (evt !== 'readable' && evt !== 'data') {
      return;
    }

    if (hasListeners(stream)) {
      sinkAdded = false;
      stream.unpipe(sinkStream);
    }
  }

  stream.on('newListener', removeSink);
  stream.on('removeListener', removeSink);
  stream.on('removeListener', addSink);

  // Sink the stream to start flowing
  // Do this on nextTick, it will flow at slowest speed of piped streams
  process.nextTick(addSink);

  return stream;
}

module.exports = sink;

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1646378070760);
})()
//miniprogram-npm-outsideDeps=["flush-write-stream"]
//# sourceMappingURL=index.js.map