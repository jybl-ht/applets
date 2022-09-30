module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1646378070762, function(require, module, exports) {
var util = require('util');
var path = require('path');
var EE = require('events').EventEmitter;

var extend = require('extend');
var resolve = require('resolve');
var flaggedRespawn = require('flagged-respawn');
var isPlainObject = require('is-plain-object');
var mapValues = require('object.map');
var fined = require('fined');

var findCwd = require('./lib/find_cwd');
var findConfig = require('./lib/find_config');
var fileSearch = require('./lib/file_search');
var parseOptions = require('./lib/parse_options');
var silentRequire = require('./lib/silent_require');
var buildConfigName = require('./lib/build_config_name');
var registerLoader = require('./lib/register_loader');
var getNodeFlags = require('./lib/get_node_flags');

function Liftoff(opts) {
  EE.call(this);
  extend(this, parseOptions(opts));
}
util.inherits(Liftoff, EE);

Liftoff.prototype.requireLocal = function(module, basedir) {
  try {
    var result = require(resolve.sync(module, { basedir: basedir }));
    this.emit('require', module, result);
    return result;
  } catch (e) {
    this.emit('requireFail', module, e);
  }
};

Liftoff.prototype.buildEnvironment = function(opts) {
  opts = opts || {};

  // get modules we want to preload
  var preload = opts.require || [];

  // ensure items to preload is an array
  if (!Array.isArray(preload)) {
    preload = [preload];
  }

  // make a copy of search paths that can be mutated for this run
  var searchPaths = this.searchPaths.slice();

  // calculate current cwd
  var cwd = findCwd(opts);

  // if cwd was provided explicitly, only use it for searching config
  if (opts.cwd) {
    searchPaths = [cwd];
  } else {
    // otherwise just search in cwd first
    searchPaths.unshift(cwd);
  }

  // calculate the regex to use for finding the config file
  var configNameSearch = buildConfigName({
    configName: this.configName,
    extensions: Object.keys(this.extensions),
  });

  // calculate configPath
  var configPath = findConfig({
    configNameSearch: configNameSearch,
    searchPaths: searchPaths,
    configPath: opts.configPath,
  });

  // if we have a config path, save the directory it resides in.
  var configBase;
  if (configPath) {
    configBase = path.dirname(configPath);
    // if cwd wasn't provided explicitly, it should match configBase
    if (!opts.cwd) {
      cwd = configBase;
    }
  }

  // TODO: break this out into lib/
  // locate local module and package next to config or explicitly provided cwd
  /* eslint one-var: 0 */
  var modulePath, modulePackage;
  try {
    var delim = path.delimiter;
    var paths = (process.env.NODE_PATH ? process.env.NODE_PATH.split(delim) : []);
    modulePath = resolve.sync(this.moduleName, { basedir: configBase || cwd, paths: paths });
    modulePackage = silentRequire(fileSearch('package.json', [modulePath]));
  } catch (e) {}

  // if we have a configuration but we failed to find a local module, maybe
  // we are developing against ourselves?
  if (!modulePath && configPath) {
    // check the package.json sibling to our config to see if its `name`
    // matches the module we're looking for
    var modulePackagePath = fileSearch('package.json', [configBase]);
    modulePackage = silentRequire(modulePackagePath);
    if (modulePackage && modulePackage.name === this.moduleName) {
      // if it does, our module path is `main` inside package.json
      modulePath = path.join(path.dirname(modulePackagePath), modulePackage.main || 'index.js');
      cwd = configBase;
    } else {
      // clear if we just required a package for some other project
      modulePackage = {};
    }
  }

  var exts = this.extensions;
  var eventEmitter = this;

  var configFiles = {};
  if (isPlainObject(this.configFiles)) {
    var notfound = { path: null };
    configFiles = mapValues(this.configFiles, function(prop, name) {
      var defaultObj = { name: name, cwd: cwd, extensions: exts };
      return mapValues(prop, function(pathObj) {
        var found = fined(pathObj, defaultObj) || notfound;
        if (isPlainObject(found.extension)) {
          registerLoader(eventEmitter, found.extension, found.path, cwd);
        }
        return found.path;
      });
    });
  }

  return {
    cwd: cwd,
    require: preload,
    configNameSearch: configNameSearch,
    configPath: configPath,
    configBase: configBase,
    modulePath: modulePath,
    modulePackage: modulePackage || {},
    configFiles: configFiles,
  };
};

Liftoff.prototype.handleFlags = function(cb) {
  if (typeof this.v8flags === 'function') {
    this.v8flags(function(err, flags) {
      if (err) {
        cb(err);
      } else {
        cb(null, flags);
      }
    });
  } else {
    process.nextTick(function() {
      cb(null, this.v8flags);
    }.bind(this));
  }
};

Liftoff.prototype.prepare = function(opts, fn) {
  if (typeof fn !== 'function') {
    throw new Error('You must provide a callback function.');
  }

  process.title = this.processTitle;

  var completion = opts.completion;
  if (completion && this.completions) {
    return this.completions(completion);
  }

  var env = this.buildEnvironment(opts);

  fn.call(this, env);
};

Liftoff.prototype.execute = function(env, forcedFlags, fn) {
  if (typeof forcedFlags === 'function') {
    fn = forcedFlags;
    forcedFlags = undefined;
  }
  if (typeof fn !== 'function') {
    throw new Error('You must provide a callback function.');
  }

  this.handleFlags(function(err, flags) {
    if (err) {
      throw err;
    }
    flags = flags || [];

    flaggedRespawn(flags, process.argv, forcedFlags, execute.bind(this));

    function execute(ready, child, argv) {
      if (child !== process) {
        var execArgv = getNodeFlags.fromReorderedArgv(argv);
        this.emit('respawn', execArgv, child);
      }
      if (ready) {
        preloadModules(this, env);
        registerLoader(this, this.extensions, env.configPath, env.cwd);
        fn.call(this, env, argv);
      }
    }
  }.bind(this));
};

Liftoff.prototype.launch = function(opts, fn) {
  if (typeof fn !== 'function') {
    throw new Error('You must provide a callback function.');
  }

  var self = this;

  self.prepare(opts, function(env) {
    var forcedFlags = getNodeFlags.arrayOrFunction(opts.forcedFlags, env);
    self.execute(env, forcedFlags, fn);
  });
};

function preloadModules(inst, env) {
  var basedir = env.cwd;
  env.require.filter(toUnique).forEach(function(module) {
    inst.requireLocal(module, basedir);
  });
}

function toUnique(elem, index, array) {
  return array.indexOf(elem) === index;
}

module.exports = Liftoff;

}, function(modId) {var map = {"./lib/find_cwd":1646378070763,"./lib/find_config":1646378070764,"./lib/file_search":1646378070765,"./lib/parse_options":1646378070766,"./lib/silent_require":1646378070767,"./lib/build_config_name":1646378070768,"./lib/register_loader":1646378070769,"./lib/get_node_flags":1646378070770}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070763, function(require, module, exports) {
var path = require('path');

module.exports = function(opts) {
  if (!opts) {
    opts = {};
  }
  var cwd = opts.cwd;
  var configPath = opts.configPath;
  // if a path to the desired config was specified
  // but no cwd was provided, use configPath dir
  if (typeof configPath === 'string' && !cwd) {
    cwd = path.dirname(path.resolve(configPath));
  }
  if (typeof cwd === 'string') {
    return path.resolve(cwd);
  }
  return process.cwd();
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070764, function(require, module, exports) {
var fs = require('fs');
var path = require('path');
var fileSearch = require('./file_search');

module.exports = function(opts) {
  opts = opts || {};
  var configNameSearch = opts.configNameSearch;
  var configPath = opts.configPath;
  var searchPaths = opts.searchPaths;
  // only search for a config if a path to one wasn't explicitly provided
  if (!configPath) {
    if (!Array.isArray(searchPaths)) {
      throw new Error('Please provide an array of paths to search for config in.');
    }
    if (!configNameSearch) {
      throw new Error('Please provide a configNameSearch.');
    }
    configPath = fileSearch(configNameSearch, searchPaths);
  }
  // confirm the configPath exists and return an absolute path to it
  if (fs.existsSync(configPath)) {
    return path.resolve(configPath);
  }
  return null;
};

}, function(modId) { var map = {"./file_search":1646378070765}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070765, function(require, module, exports) {
var findup = require('findup-sync');

module.exports = function(search, paths) {
  var path;
  var len = paths.length;
  for (var i = 0; i < len; i++) {
    if (path) {
      break;
    } else {
      path = findup(search, { cwd: paths[i], nocase: true });
    }
  }
  return path;
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070766, function(require, module, exports) {
var extend = require('extend');

module.exports = function(opts) {
  var defaults = {
    extensions: {
      '.js': null,
      '.json': null,
    },
    searchPaths: [],
  };
  if (!opts) {
    opts = {};
  }
  if (opts.name) {
    if (!opts.processTitle) {
      opts.processTitle = opts.name;
    }
    if (!opts.configName) {
      opts.configName = opts.name + 'file';
    }
    if (!opts.moduleName) {
      opts.moduleName = opts.name;
    }
  }
  if (!opts.processTitle) {
    throw new Error('You must specify a processTitle.');
  }
  if (!opts.configName) {
    throw new Error('You must specify a configName.');
  }
  if (!opts.moduleName) {
    throw new Error('You must specify a moduleName.');
  }
  return extend(defaults, opts);
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070767, function(require, module, exports) {
module.exports = function(path) {
  try {
    return require(path);
  } catch (e) {}
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070768, function(require, module, exports) {
module.exports = function(opts) {
  opts = opts || {};
  var configName = opts.configName;
  var extensions = opts.extensions;
  if (!configName) {
    throw new Error('Please specify a configName.');
  }
  if (configName instanceof RegExp) {
    return [configName];
  }
  if (!Array.isArray(extensions)) {
    throw new Error('Please provide an array of valid extensions.');
  }
  return extensions.map(function(ext) {
    return configName + ext;
  });
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070769, function(require, module, exports) {
var rechoir = require('rechoir');

module.exports = function(eventEmitter, extensions, configPath, cwd) {
  extensions = extensions || {};

  if (typeof configPath !== 'string') {
    return;
  }

  var autoloads = rechoir.prepare(extensions, configPath, cwd, true);
  if (autoloads instanceof Error) { // Only errors
    autoloads.failures.forEach(function(failed) {
      eventEmitter.emit('requireFail', failed.moduleName, failed.error);
    });
    return;
  }

  if (!Array.isArray(autoloads)) { // Already required or no config.
    return;
  }

  var succeeded = autoloads[autoloads.length - 1];
  eventEmitter.emit('require', succeeded.moduleName, succeeded.module);
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070770, function(require, module, exports) {
function arrayOrFunction(arrayOrFunc, env) {
  if (typeof arrayOrFunc === 'function') {
    return arrayOrFunc.call(this, env);
  }
  if (Array.isArray(arrayOrFunc)) {
    return arrayOrFunc;
  }
  if (typeof arrayOrFunc === 'string') {
    return [arrayOrFunc];
  }
  return [];
}

function fromReorderedArgv(reorderedArgv) {
  var nodeFlags = [];
  for (var i = 1, n = reorderedArgv.length; i < n; i++) {
    var arg = reorderedArgv[i];
    if (!/^-/.test(arg) || arg === '--') {
      break;
    }
    nodeFlags.push(arg);
  }
  return nodeFlags;
}

module.exports = {
  arrayOrFunction: arrayOrFunction,
  fromReorderedArgv: fromReorderedArgv,
};


}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1646378070762);
})()
//miniprogram-npm-outsideDeps=["util","path","events","extend","resolve","flagged-respawn","is-plain-object","object.map","fined","fs","findup-sync","rechoir"]
//# sourceMappingURL=index.js.map