module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1646378070215, function(require, module, exports) {


var PassThrough = require('readable-stream').PassThrough
var inherits = require('inherits')
var p = require('process-nextick-args')

function Cloneable (stream, opts) {
  if (!(this instanceof Cloneable)) {
    return new Cloneable(stream, opts)
  }

  var objectMode = stream._readableState.objectMode
  this._original = stream
  this._clonesCount = 1

  opts = opts || {}
  opts.objectMode = objectMode

  PassThrough.call(this, opts)

  forwardDestroy(stream, this)

  this.on('newListener', onData)
  this.once('resume', onResume)

  this._hasListener = true
}

inherits(Cloneable, PassThrough)

function onData (event, listener) {
  if (event === 'data' || event === 'readable') {
    this._hasListener = false
    this.removeListener('newListener', onData)
    this.removeListener('resume', onResume)
    p.nextTick(clonePiped, this)
  }
}

function onResume () {
  this._hasListener = false
  this.removeListener('newListener', onData)
  p.nextTick(clonePiped, this)
}

Cloneable.prototype.clone = function () {
  if (!this._original) {
    throw new Error('already started')
  }

  this._clonesCount++

  // the events added by the clone should not count
  // for starting the flow
  this.removeListener('newListener', onData)
  var clone = new Clone(this)
  if (this._hasListener) {
    this.on('newListener', onData)
  }

  return clone
}

Cloneable.prototype._destroy = function (err, cb) {
  if (!err) {
    this.push(null)
    this.end()
    this.emit('close')
  }

  p.nextTick(cb, err)
}

function forwardDestroy (src, dest) {
  src.on('error', destroy)
  src.on('close', onClose)

  function destroy (err) {
    src.removeListener('close', onClose)
    dest.destroy(err)
  }

  function onClose () {
    dest.end()
  }
}

function clonePiped (that) {
  if (--that._clonesCount === 0 && !that._readableState.destroyed) {
    that._original.pipe(that)
    that._original = undefined
  }
}

function Clone (parent, opts) {
  if (!(this instanceof Clone)) {
    return new Clone(parent, opts)
  }

  var objectMode = parent._readableState.objectMode

  opts = opts || {}
  opts.objectMode = objectMode

  this.parent = parent

  PassThrough.call(this, opts)

  forwardDestroy(parent, this)

  parent.pipe(this)

  // the events added by the clone should not count
  // for starting the flow
  // so we add the newListener handle after we are done
  this.on('newListener', onDataClone)
  this.on('resume', onResumeClone)
}

function onDataClone (event, listener) {
  // We start the flow once all clones are piped or destroyed
  if (event === 'data' || event === 'readable' || event === 'close') {
    p.nextTick(clonePiped, this.parent)
    this.removeListener('newListener', onDataClone)
  }
}

function onResumeClone () {
  this.removeListener('newListener', onDataClone)
  p.nextTick(clonePiped, this.parent)
}

inherits(Clone, PassThrough)

Clone.prototype.clone = function () {
  return this.parent.clone()
}

Cloneable.isCloneable = function (stream) {
  return stream instanceof Cloneable || stream instanceof Clone
}

Clone.prototype._destroy = function (err, cb) {
  if (!err) {
    this.push(null)
    this.end()
    this.emit('close')
  }

  p.nextTick(cb, err)
}

module.exports = Cloneable

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1646378070215);
})()
//miniprogram-npm-outsideDeps=["readable-stream","inherits","process-nextick-args"]
//# sourceMappingURL=index.js.map