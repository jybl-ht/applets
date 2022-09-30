module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1646378070160, function(require, module, exports) {


var os = require('os');
var equals = require('buffer-equal');
var cr = new Buffer('\r\n');
var nl = new Buffer('\n');

/**
 * Append a buffer to another buffer ensuring to preserve line ending characters.
 *
 * ```js
 * console.log([appendBuffer(new Buffer('abc\r\n'), new Buffer('def')).toString()]);
 * //=> [ 'abc\r\ndef\r\n' ]
 *
 * console.log([appendBuffer(new Buffer('abc\n'), new Buffer('def')).toString()]);
 * //=> [ 'abc\ndef\n' ]
 *
 * // uses os.EOL when a line ending is not found
 * console.log([appendBuffer(new Buffer('abc'), new Buffer('def')).toString()]);
 * //=> [ 'abc\ndef' ]
 * * ```
 * @param  {Buffer} `buf` Buffer that will be used to check for an existing line ending. The suffix is appended to this.
 * @param  {Buffer} `suffix` Buffer that will be appended to the buf.
 * @return {Buffer} Final Buffer
 * @api public
 */

module.exports = function appendBuffer(buf, suffix) {
  if (!suffix || !suffix.length) {
    return buf;
  }
  var eol;
  if (equals(buf.slice(-2), cr)) {
    eol = cr;
  } else if (equals(buf.slice(-1), nl)) {
    eol = nl;
  } else {
    return Buffer.concat([buf, new Buffer(os.EOL), new Buffer(suffix)]);
  }
  return Buffer.concat([buf, new Buffer(suffix), eol]);
};

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1646378070160);
})()
//miniprogram-npm-outsideDeps=["os","buffer-equal"]
//# sourceMappingURL=index.js.map