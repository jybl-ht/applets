module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1646378070639, function(require, module, exports) {
(function() {
  

  /**
   * Extend an Object with another Object's properties.
   *
   * The source objects are specified as additional arguments.
   *
   * @param dst Object the object to extend.
   *
   * @return Object the final object.
   */
  var _extend = function(dst) {
    var sources = Array.prototype.slice.call(arguments, 1);
    for (var i=0; i<sources.length; ++i) {
      var src = sources[i];
      for (var p in src) {
        if (src.hasOwnProperty(p)) dst[p] = src[p];
      }
    }
    return dst;
  };


  /**
   * Defer execution of given function.
   * @param  {Function} func
   */
  var _defer = function(func) {
    if (typeof setImmediate === 'function') {
      return setImmediate(func);
    } else {
      return setTimeout(func, 0);
    }
  };

  /**
   * Based on the algorithm at http://en.wikipedia.org/wiki/Levenshtein_distance.
   */
  var Levenshtein = {
    /**
     * Calculate levenshtein distance of the two strings.
     *
     * @param str1 String the first string.
     * @param str2 String the second string.
     * @return Integer the levenshtein distance (0 and above).
     */
    get: function(str1, str2) {
      // base cases
      if (str1 === str2) return 0;
      if (str1.length === 0) return str2.length;
      if (str2.length === 0) return str1.length;

      // two rows
      var prevRow  = new Array(str2.length + 1),
          curCol, nextCol, i, j, tmp;

      // initialise previous row
      for (i=0; i<prevRow.length; ++i) {
        prevRow[i] = i;
      }

      // calculate current row distance from previous row
      for (i=0; i<str1.length; ++i) {
        nextCol = i + 1;

        for (j=0; j<str2.length; ++j) {
          curCol = nextCol;

          // substution
          nextCol = prevRow[j] + ( (str1.charAt(i) === str2.charAt(j)) ? 0 : 1 );
          // insertion
          tmp = curCol + 1;
          if (nextCol > tmp) {
            nextCol = tmp;
          }
          // deletion
          tmp = prevRow[j + 1] + 1;
          if (nextCol > tmp) {
            nextCol = tmp;
          }

          // copy current col value into previous (in preparation for next iteration)
          prevRow[j] = curCol;
        }

        // copy last col value into previous (in preparation for next iteration)
        prevRow[j] = nextCol;
      }

      return nextCol;
    },

    /**
     * Asynchronously calculate levenshtein distance of the two strings.
     *
     * @param str1 String the first string.
     * @param str2 String the second string.
     * @param cb Function callback function with signature: function(Error err, int distance)
     * @param [options] Object additional options.
     * @param [options.progress] Function progress callback with signature: function(percentComplete)
     */
    getAsync: function(str1, str2, cb, options) {
      options = _extend({}, {
        progress: null
      }, options);

      // base cases
      if (str1 === str2) return cb(null, 0);
      if (str1.length === 0) return cb(null, str2.length);
      if (str2.length === 0) return cb(null, str1.length);

      // two rows
      var prevRow  = new Array(str2.length + 1),
          curCol, nextCol,
          i, j, tmp,
          startTime, currentTime;

      // initialise previous row
      for (i=0; i<prevRow.length; ++i) {
        prevRow[i] = i;
      }

      nextCol = 1;
      i = 0;
      j = -1;

      var __calculate = function() {
        // reset timer
        startTime = new Date().valueOf();
        currentTime = startTime;

        // keep going until one second has elapsed
        while (currentTime - startTime < 1000) {
          // reached end of current row?
          if (str2.length <= (++j)) {
            // copy current into previous (in preparation for next iteration)
            prevRow[j] = nextCol;

            // if already done all chars
            if (str1.length <= (++i)) {
              return cb(null, nextCol);
            }
            // else if we have more left to do
            else {
              nextCol = i + 1;
              j = 0;
            }
          }

          // calculation
          curCol = nextCol;

          // substution
          nextCol = prevRow[j] + ( (str1.charAt(i) === str2.charAt(j)) ? 0 : 1 );
          // insertion
          tmp = curCol + 1;
          if (nextCol > tmp) {
            nextCol = tmp;
          }
          // deletion
          tmp = prevRow[j + 1] + 1;
          if (nextCol > tmp) {
            nextCol = tmp;
          }

          // copy current into previous (in preparation for next iteration)
          prevRow[j] = curCol;

          // get current time
          currentTime = new Date().valueOf();
        }

        // send a progress update?
        if (null !== options.progress) {
          try {
            options.progress.call(null, (i * 100.0/ str1.length));
          } catch (err) {
            return cb('Progress callback: ' + err.toString());
          }
        }

        // next iteration
        _defer(__calculate);
      };

      __calculate();
    }

  };

  // amd
  if (typeof define !== "undefined" && define !== null && define.amd) {
    define(function() {
      return Levenshtein;
    });
  }
  // commonjs
  else if (typeof module !== "undefined" && module !== null && typeof exports !== "undefined" && module.exports === exports) {
    module.exports = Levenshtein;
  }
  // web worker
  else if (typeof self !== "undefined" && typeof self.postMessage === 'function' && typeof self.importScripts === 'function') {
    self.Levenshtein = Levenshtein;
  }
  // browser main thread
  else if (typeof window !== "undefined" && window !== null) {
    window.Levenshtein = Levenshtein;
  }
}());


}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1646378070639);
})()
//miniprogram-npm-outsideDeps=[]
//# sourceMappingURL=index.js.map