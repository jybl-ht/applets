module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1646378070667, function(require, module, exports) {


var chokidar = require('chokidar');
var debounce = require('just-debounce');
var asyncDone = require('async-done');
var defaults = require('object.defaults/immutable');
var isNegatedGlob = require('is-negated-glob');
var anymatch = require('anymatch');
var normalize = require('normalize-path');

var defaultOpts = {
  delay: 200,
  events: ['add', 'change', 'unlink'],
  ignored: [],
  ignoreInitial: true,
  queue: true,
};

function listenerCount(ee, evtName) {
  if (typeof ee.listenerCount === 'function') {
    return ee.listenerCount(evtName);
  }

  return ee.listeners(evtName).length;
}

function hasErrorListener(ee) {
  return listenerCount(ee, 'error') !== 0;
}

function exists(val) {
  return val != null;
}

function watch(glob, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  var opt = defaults(options, defaultOpts);

  if (!Array.isArray(opt.events)) {
    opt.events = [opt.events];
  }

  if (Array.isArray(glob)) {
    // We slice so we don't mutate the passed globs array
    glob = glob.slice();
  } else {
    glob = [glob];
  }

  var queued = false;
  var running = false;

  // These use sparse arrays to keep track of the index in the
  // original globs array
  var positives = new Array(glob.length);
  var negatives = new Array(glob.length);

  // Reverse the glob here so we don't end up with a positive
  // and negative glob in position 0 after a reverse
  glob.reverse().forEach(sortGlobs);

  function sortGlobs(globString, index) {
    var result = isNegatedGlob(globString);
    if (result.negated) {
      negatives[index] = result.pattern;
    } else {
      positives[index] = result.pattern;
    }
  }

  var toWatch = positives.filter(exists);

  function joinCwd(glob) {
    if (glob && opt.cwd) {
      return normalize(opt.cwd + '/' + glob);
    }

    return glob;
  }

  // We only do add our custom `ignored` if there are some negative globs
  // TODO: I'm not sure how to test this
  if (negatives.some(exists)) {
    var normalizedPositives = positives.map(joinCwd);
    var normalizedNegatives = negatives.map(joinCwd);
    var shouldBeIgnored = function(path) {
      var positiveMatch = anymatch(normalizedPositives, path, true);
      var negativeMatch = anymatch(normalizedNegatives, path, true);
      // If negativeMatch is -1, that means it was never negated
      if (negativeMatch === -1) {
        return false;
      }

      // If the negative is "less than" the positive, that means
      // it came later in the glob array before we reversed them
      return negativeMatch < positiveMatch;
    };

    opt.ignored = [].concat(opt.ignored, shouldBeIgnored);
  }
  var watcher = chokidar.watch(toWatch, opt);

  function runComplete(err) {
    running = false;

    if (err && hasErrorListener(watcher)) {
      watcher.emit('error', err);
    }

    // If we have a run queued, start onChange again
    if (queued) {
      queued = false;
      onChange();
    }
  }

  function onChange() {
    if (running) {
      if (opt.queue) {
        queued = true;
      }
      return;
    }

    running = true;
    asyncDone(cb, runComplete);
  }

  var fn;
  if (typeof cb === 'function') {
    fn = debounce(onChange, opt.delay);
  }

  function watchEvent(eventName) {
    watcher.on(eventName, fn);
  }

  if (fn) {
    opt.events.forEach(watchEvent);
  }

  return watcher;
}

module.exports = watch;

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1646378070667);
})()
//miniprogram-npm-outsideDeps=["chokidar","just-debounce","async-done","object.defaults/immutable","is-negated-glob","anymatch","normalize-path"]
//# sourceMappingURL=index.js.map