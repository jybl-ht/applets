module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1646378070159, function(require, module, exports) {


var micromatch = require('micromatch');
var normalize = require('normalize-path');
var path = require('path'); // required for tests.
var arrify = function(a) { return a == null ? [] : (Array.isArray(a) ? a : [a]); };

var anymatch = function(criteria, value, returnIndex, startIndex, endIndex) {
  criteria = arrify(criteria);
  value = arrify(value);
  if (arguments.length === 1) {
    return anymatch.bind(null, criteria.map(function(criterion) {
      return typeof criterion === 'string' && criterion[0] !== '!' ?
        micromatch.matcher(criterion) : criterion;
    }));
  }
  startIndex = startIndex || 0;
  var string = value[0];
  var altString, altValue;
  var matched = false;
  var matchIndex = -1;
  function testCriteria(criterion, index) {
    var result;
    switch (Object.prototype.toString.call(criterion)) {
    case '[object String]':
      result = string === criterion || altString && altString === criterion;
      result = result || micromatch.isMatch(string, criterion);
      break;
    case '[object RegExp]':
      result = criterion.test(string) || altString && criterion.test(altString);
      break;
    case '[object Function]':
      result = criterion.apply(null, value);
      result = result || altValue && criterion.apply(null, altValue);
      break;
    default:
      result = false;
    }
    if (result) {
      matchIndex = index + startIndex;
    }
    return result;
  }
  var crit = criteria;
  var negGlobs = crit.reduce(function(arr, criterion, index) {
    if (typeof criterion === 'string' && criterion[0] === '!') {
      if (crit === criteria) {
        // make a copy before modifying
        crit = crit.slice();
      }
      crit[index] = null;
      arr.push(criterion.substr(1));
    }
    return arr;
  }, []);
  if (!negGlobs.length || !micromatch.any(string, negGlobs)) {
    if (path.sep === '\\' && typeof string === 'string') {
      altString = normalize(string);
      altString = altString === string ? null : altString;
      if (altString) altValue = [altString].concat(value.slice(1));
    }
    matched = crit.slice(startIndex, endIndex).some(testCriteria);
  }
  return returnIndex === true ? matchIndex : matched;
};

module.exports = anymatch;

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1646378070159);
})()
//miniprogram-npm-outsideDeps=["micromatch","normalize-path","path"]
//# sourceMappingURL=index.js.map