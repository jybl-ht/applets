module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1646378070615, function(require, module, exports) {


module.exports = require("./is-implemented")() ? WeakMap : require("./polyfill");

}, function(modId) {var map = {"./is-implemented":1646378070616,"./polyfill":1646378070617}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070616, function(require, module, exports) {


module.exports = function () {
	var weakMap, obj;

	if (typeof WeakMap !== "function") return false;
	try {
		// WebKit doesn't support arguments and crashes
		weakMap = new WeakMap([[obj = {}, "one"], [{}, "two"], [{}, "three"]]);
	} catch (e) {
		return false;
	}
	if (String(weakMap) !== "[object WeakMap]") return false;
	if (typeof weakMap.set !== "function") return false;
	if (weakMap.set({}, 1) !== weakMap) return false;
	if (typeof weakMap.delete !== "function") return false;
	if (typeof weakMap.has !== "function") return false;
	if (weakMap.get(obj) !== "one") return false;

	return true;
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070617, function(require, module, exports) {


var isValue           = require("es5-ext/object/is-value")
  , setPrototypeOf    = require("es5-ext/object/set-prototype-of")
  , object            = require("es5-ext/object/valid-object")
  , ensureValue       = require("es5-ext/object/valid-value")
  , randomUniq        = require("es5-ext/string/random-uniq")
  , d                 = require("d")
  , getIterator       = require("es6-iterator/get")
  , forOf             = require("es6-iterator/for-of")
  , toStringTagSymbol = require("es6-symbol").toStringTag
  , isNative          = require("./is-native-implemented")

  , isArray = Array.isArray, defineProperty = Object.defineProperty
  , objHasOwnProperty = Object.prototype.hasOwnProperty, getPrototypeOf = Object.getPrototypeOf
  , WeakMapPoly;

module.exports = WeakMapPoly = function (/* Iterable*/) {
	var iterable = arguments[0], self;

	if (!(this instanceof WeakMapPoly)) throw new TypeError("Constructor requires 'new'");
	self = isNative && setPrototypeOf && (WeakMap !== WeakMapPoly)
		? setPrototypeOf(new WeakMap(), getPrototypeOf(this)) : this;

	if (isValue(iterable)) {
		if (!isArray(iterable)) iterable = getIterator(iterable);
	}
	defineProperty(self, "__weakMapData__", d("c", "$weakMap$" + randomUniq()));
	if (!iterable) return self;
	forOf(iterable, function (val) {
		ensureValue(val);
		self.set(val[0], val[1]);
	});
	return self;
};

if (isNative) {
	if (setPrototypeOf) setPrototypeOf(WeakMapPoly, WeakMap);
	WeakMapPoly.prototype = Object.create(WeakMap.prototype, { constructor: d(WeakMapPoly) });
}

Object.defineProperties(WeakMapPoly.prototype, {
	delete: d(function (key) {
		if (objHasOwnProperty.call(object(key), this.__weakMapData__)) {
			delete key[this.__weakMapData__];
			return true;
		}
		return false;
	}),
	get: d(function (key) {
		if (!objHasOwnProperty.call(object(key), this.__weakMapData__)) return undefined;
		return key[this.__weakMapData__];
	}),
	has: d(function (key) {
		return objHasOwnProperty.call(object(key), this.__weakMapData__);
	}),
	set: d(function (key, value) {
		defineProperty(object(key), this.__weakMapData__, d("c", value));
		return this;
	}),
	toString: d(function () {
		return "[object WeakMap]";
	})
});
defineProperty(WeakMapPoly.prototype, toStringTagSymbol, d("c", "WeakMap"));

}, function(modId) { var map = {"./is-native-implemented":1646378070618}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070618, function(require, module, exports) {
// Exports true if environment provides native `WeakMap` implementation, whatever that is.



module.exports = (function () {
	if (typeof WeakMap !== "function") return false;
	return Object.prototype.toString.call(new WeakMap()) === "[object WeakMap]";
}());

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1646378070615);
})()
//miniprogram-npm-outsideDeps=["es5-ext/object/is-value","es5-ext/object/set-prototype-of","es5-ext/object/valid-object","es5-ext/object/valid-value","es5-ext/string/random-uniq","d","es6-iterator/get","es6-iterator/for-of","es6-symbol"]
//# sourceMappingURL=index.js.map