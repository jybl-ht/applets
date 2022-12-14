module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1646378070771, function(require, module, exports) {

var path = require('path');
var fs = require('graceful-fs');
var stripBom = require('strip-bom');
var parseJson = require('parse-json');
var Promise = require('pinkie-promise');
var pify = require('pify');

function parse(x, fp) {
	return parseJson(stripBom(x), path.relative(process.cwd(), fp));
}

module.exports = function (fp) {
	return pify(fs.readFile, Promise)(fp, 'utf8').then(function (data) {
		return parse(data, fp);
	});
};

module.exports.sync = function (fp) {
	return parse(fs.readFileSync(fp, 'utf8'), fp);
};

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1646378070771);
})()
//miniprogram-npm-outsideDeps=["path","graceful-fs","strip-bom","parse-json","pinkie-promise","pify"]
//# sourceMappingURL=index.js.map