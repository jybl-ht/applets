module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1646378070678, function(require, module, exports) {


var fs = require('fs');
var path = require('path');
var log = require('gulplog');
var yargs = require('yargs');
var Liftoff = require('liftoff');
var interpret = require('interpret');
var v8flags = require('v8flags');
var findRange = require('semver-greatest-satisfied-range');
var ansi = require('./lib/shared/ansi');
var exit = require('./lib/shared/exit');
var tildify = require('./lib/shared/tildify');
var makeTitle = require('./lib/shared/make-title');
var cliOptions = require('./lib/shared/cli-options');
var completion = require('./lib/shared/completion');
var verifyDeps = require('./lib/shared/verify-dependencies');
var cliVersion = require('./package.json').version;
var getBlacklist = require('./lib/shared/get-blacklist');
var toConsole = require('./lib/shared/log/to-console');

var loadConfigFiles = require('./lib/shared/config/load-files');
var mergeConfigToCliFlags = require('./lib/shared/config/cli-flags');
var mergeConfigToEnvFlags = require('./lib/shared/config/env-flags');

// Logging functions
var logVerify = require('./lib/shared/log/verify');
var logBlacklistError = require('./lib/shared/log/blacklist-error');

// Get supported ranges
var ranges = fs.readdirSync(path.join(__dirname, '/lib/versioned/'));

// Set env var for ORIGINAL cwd
// before anything touches it
process.env.INIT_CWD = process.cwd();

var cli = new Liftoff({
  name: 'gulp',
  processTitle: makeTitle('gulp', process.argv.slice(2)),
  completions: completion,
  extensions: interpret.jsVariants,
  v8flags: v8flags,
  configFiles: {
    '.gulp': {
      home: {
        path: '~',
        extensions: interpret.extensions,
      },
      cwd: {
        path: '.',
        extensions: interpret.extensions,
      },
    },
  },
});

var usage =
  '\n' + ansi.bold('Usage:') +
  ' gulp ' + ansi.blue('[options]') + ' tasks';

var parser = yargs.usage(usage, cliOptions);
var opts = parser.argv;

cli.on('require', function(name) {
  // This is needed because interpret needs to stub the .mjs extension
  // Without the .mjs require hook, rechoir blows up
  // However, we don't want to show the mjs-stub loader in the logs
  if (path.basename(name, '.js') !== 'mjs-stub') {
    log.info('Requiring external module', ansi.magenta(name));
  }
});

cli.on('requireFail', function(name, error) {
  log.warn(
    ansi.yellow('Failed to load external module'),
    ansi.magenta(name)
  );
  /* istanbul ignore else */
  if (error) {
    log.warn(ansi.yellow(error.toString()));
  }
});

cli.on('respawn', function(flags, child) {
  var nodeFlags = ansi.magenta(flags.join(', '));
  var pid = ansi.magenta(child.pid);
  log.info('Node flags detected:', nodeFlags);
  log.info('Respawned to PID:', pid);
});

function run() {
  cli.prepare({
    cwd: opts.cwd,
    configPath: opts.gulpfile,
    require: opts.require,
    completion: opts.completion,
  }, function(env) {
    var cfgLoadOrder = ['home', 'cwd'];
    var cfg = loadConfigFiles(env.configFiles['.gulp'], cfgLoadOrder);
    opts = mergeConfigToCliFlags(opts, cfg);
    env = mergeConfigToEnvFlags(env, cfg, opts);
    env.configProps = cfg;

    // Set up event listeners for logging again after configuring.
    toConsole(log, opts);

    cli.execute(env, env.nodeFlags, handleArguments);
  });
}

module.exports = run;

// The actual logic
function handleArguments(env) {

  // This translates the --continue flag in gulp
  // To the settle env variable for undertaker
  // We use the process.env so the user's gulpfile
  // Can know about the flag
  if (opts.continue) {
    process.env.UNDERTAKER_SETTLE = 'true';
  }

  if (opts.help) {
    parser.showHelp(console.log);
    exit(0);
  }

  // Anything that needs to print outside of the logging mechanism should use console.log
  if (opts.version) {
    console.log('CLI version:', cliVersion);
    console.log('Local version:', env.modulePackage.version || 'Unknown');
    exit(0);
  }

  if (opts.verify) {
    var pkgPath = opts.verify !== true ? opts.verify : 'package.json';
    /* istanbul ignore else */
    if (path.resolve(pkgPath) !== path.normalize(pkgPath)) {
      pkgPath = path.join(env.cwd, pkgPath);
    }
    log.info('Verifying plugins in ' + pkgPath);
    return getBlacklist(function(err, blacklist) {
      /* istanbul ignore if */
      if (err) {
        return logBlacklistError(err);
      }

      var blacklisted = verifyDeps(require(pkgPath), blacklist);

      logVerify(blacklisted);
    });
  }

  if (!env.modulePath) {
    /* istanbul ignore next */
    var missingNodeModules =
      fs.existsSync(path.join(env.cwd, 'package.json'))
      && !fs.existsSync(path.join(env.cwd, 'node_modules'));

    /* istanbul ignore next */
    var missingGulpMessage =
      missingNodeModules
        ? 'Local modules not found in'
        : 'Local gulp not found in';
    log.error(
      ansi.red(missingGulpMessage),
      ansi.magenta(tildify(env.cwd))
    );
    var hasYarn = fs.existsSync(path.join(env.cwd, 'yarn.lock'));
    /* istanbul ignore next */
    var installCommand =
      missingNodeModules
        ? hasYarn
          ? 'yarn install'
          : 'npm install'
        : hasYarn
          ? 'yarn add gulp'
        : 'npm install gulp';
    log.error(ansi.red('Try running: ' + installCommand));
    exit(1);
  }

  if (!env.configPath) {
    log.error(ansi.red('No gulpfile found'));
    exit(1);
  }

  // Chdir before requiring gulpfile to make sure
  // we let them chdir as needed
  if (process.cwd() !== env.cwd) {
    process.chdir(env.cwd);
    log.info(
      'Working directory changed to',
      ansi.magenta(tildify(env.cwd))
    );
  }

  // Find the correct CLI version to run
  var range = findRange(env.modulePackage.version, ranges);

  if (!range) {
    log.error(
      ansi.red('Unsupported gulp version', env.modulePackage.version)
    );
    exit(1);
  }

  // Load and execute the CLI version
  var versionedDir = path.join(__dirname, '/lib/versioned/', range, '/');
  require(versionedDir)(opts, env, env.configProps);
}

}, function(modId) {var map = {"./lib/shared/ansi":1646378070679,"./lib/shared/exit":1646378070680,"./lib/shared/tildify":1646378070681,"./lib/shared/make-title":1646378070682,"./lib/shared/cli-options":1646378070683,"./lib/shared/completion":1646378070684,"./lib/shared/verify-dependencies":1646378070685,"./package.json":1646378070686,"./lib/shared/get-blacklist":1646378070687,"./lib/shared/log/to-console":1646378070688,"./lib/shared/config/load-files":1646378070689,"./lib/shared/config/cli-flags":1646378070690,"./lib/shared/config/env-flags":1646378070691,"./lib/shared/log/verify":1646378070692,"./lib/shared/log/blacklist-error":1646378070693}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070679, function(require, module, exports) {


var colors = require('ansi-colors');
var supportsColor = require('color-support');

var hasColors = colorize();

/* istanbul ignore next */
module.exports = {
  red: hasColors ? colors.red : noColor,
  green: hasColors ? colors.green : noColor,
  blue: hasColors ? colors.blue : noColor,
  magenta: hasColors ? colors.magenta : noColor,
  cyan: hasColors ? colors.cyan : noColor,
  white: hasColors ? colors.white : noColor,
  gray: hasColors ? colors.gray : noColor,
  bgred: hasColors ? colors.bgred : noColor,
  bold: hasColors ? colors.bold : noColor,
  yellow: hasColors ? colors.yellow : noColor,
};

function noColor(message) {
  return message;
}

function hasFlag(flag) {
  return (process.argv.indexOf('--' + flag) !== -1);
}

function colorize() {
  if (hasFlag('no-color')) {
    return false;
  }

  /* istanbul ignore if */
  if (hasFlag('color')) {
    return true;
  }

  return supportsColor();
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070680, function(require, module, exports) {


// Fix stdout truncation on windows
function exit(code) {
  /* istanbul ignore next */
  if (process.platform === 'win32' && process.stdout.bufferSize) {
    process.stdout.once('drain', function() {
      process.exit(code);
    });
    return;
  }
  process.exit(code);
}

module.exports = exit;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070681, function(require, module, exports) {


var replaceHomedir = require('replace-homedir');

function tildify(filepath) {
  return replaceHomedir(filepath, '~');
}

module.exports = tildify;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070682, function(require, module, exports) {


function makeTitle(cmd, argv) {
  if (!argv || argv.length === 0) {
    return cmd;
  }

  return [cmd].concat(argv).join(' ');
}

module.exports = makeTitle;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070683, function(require, module, exports) {


var ansi = require('./ansi');

module.exports = {
  help: {
    alias: 'h',
    type: 'boolean',
    desc: ansi.gray(
      'Show this help.'),
  },
  version: {
    alias: 'v',
    type: 'boolean',
    desc: ansi.gray(
      'Print the global and local gulp versions.'),
  },
  require: {
    type: 'string',
    requiresArg: true,
    desc: ansi.gray(
      'Will require a module before running the gulpfile. ' +
      'This is useful for transpilers but also has other applications.'),
  },
  gulpfile: {
    alias: 'f',
    type: 'string',
    requiresArg: true,
    desc: ansi.gray(
      'Manually set path of gulpfile. Useful if you have multiple gulpfiles. ' +
      'This will set the CWD to the gulpfile directory as well.'),
  },
  cwd: {
    type: 'string',
    requiresArg: true,
    desc: ansi.gray(
      'Manually set the CWD. The search for the gulpfile, ' +
      'as well as the relativity of all requires will be from here.'),
  },
  verify: {
    desc: ansi.gray(
      'Will verify plugins referenced in project\'s package.json against ' +
      'the plugins blacklist.'),
  },
  tasks: {
    alias: 'T',
    type: 'boolean',
    desc: ansi.gray(
      'Print the task dependency tree for the loaded gulpfile.'),
  },
  'tasks-simple': {
    type: 'boolean',
    desc: ansi.gray(
      'Print a plaintext list of tasks for the loaded gulpfile.'),
  },
  'tasks-json': {
    desc: ansi.gray(
      'Print the task dependency tree, ' +
      'in JSON format, for the loaded gulpfile.'),
  },
  'tasks-depth': {
    alias: 'depth',
    type: 'number',
    requiresArg: true,
    default: undefined,  // To detect if this cli option is specified.
    desc: ansi.gray(
      'Specify the depth of the task dependency tree.'),
  },
  'compact-tasks': {
    type: 'boolean',
    default: undefined,  // To detect if this cli option is specified.
    desc: ansi.gray(
      'Reduce the output of task dependency tree by printing ' +
      'only top tasks and their child tasks.'),
  },
  'sort-tasks': {
    type: 'boolean',
    default: undefined,  // To detect if this cli option is specified.
    desc: ansi.gray(
      'Will sort top tasks of task dependency tree.'),
  },
  color: {
    type: 'boolean',
    desc: ansi.gray(
      'Will force gulp and gulp plugins to display colors, ' +
      'even when no color support is detected.'),
  },
  'no-color': {
    type: 'boolean',
    desc: ansi.gray(
      'Will force gulp and gulp plugins to not display colors, ' +
      'even when color support is detected.'),
  },
  silent: {
    alias: 'S',
    type: 'boolean',
    default: undefined,  // To detect if this cli option is specified.
    desc: ansi.gray(
      'Suppress all gulp logging.'),
  },
  continue: {
    type: 'boolean',
    default: undefined,  // To detect if this cli option is specified.
    desc: ansi.gray(
      'Continue execution of tasks upon failure.'),
  },
  series: {
    type: 'boolean',
    default: undefined,  // To detect if this cli option is specified.
    desc: ansi.gray(
      'Run tasks given on the CLI in series (the default is parallel).'),
  },
  'log-level': {
    alias: 'L',
    // Type isn't needed because count acts as a boolean
    count: true,
    default: undefined,  // To detect if this cli option is specified.
    desc: ansi.gray(
      'Set the loglevel. -L for least verbose and -LLLL for most verbose. ' +
      '-LLL is default.'),
  },
};

}, function(modId) { var map = {"./ansi":1646378070679}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070684, function(require, module, exports) {


var fs = require('fs');
var path = require('path');

module.exports = function(name) {
  if (typeof name !== 'string') {
    throw new Error('Missing completion type');
  }
  var file = path.join(__dirname, '../../completion', name);
  try {
    console.log(fs.readFileSync(file, 'utf8'));
    process.exit(0);
  } catch (err) {
    console.log(
      'echo "gulp autocompletion rules for',
      '\'' + name + '\'',
      'not found"'
    );
    process.exit(5);
  }
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070685, function(require, module, exports) {


var matchdep = require('matchdep');

/**
 * Given a collection of plugin names verifies this collection against
 * the blacklist. Returns an object with:
 * [plugin name]=>[blacklisting reason]
 * or an empty object if none of the dependencies to check are blacklisted.
 *
 * @param pkg - package.json contents
 * @param blacklist - contents of the blacklist in JSON format
 */
function verifyDependencies(pkg, blacklist) {
  var blacklisted = matchdep
    .filterAll(Object.keys(blacklist), pkg)
    .reduce(function(blacklisted, pluginName) {
      blacklisted[pluginName] = blacklist[pluginName];
      return blacklisted;
    }, {});

  return blacklisted;
}

module.exports = verifyDependencies;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070686, function(require, module, exports) {
module.exports = {
  "name": "gulp-cli",
  "version": "2.3.0",
  "description": "Command line interface for gulp",
  "author": "Gulp Team <team@gulpjs.com> (https://gulpjs.com/)",
  "contributors": [],
  "homepage": "https://gulpjs.com",
  "repository": "gulpjs/gulp-cli",
  "license": "MIT",
  "man": "gulp.1",
  "engines": {
    "node": ">= 0.10"
  },
  "main": "index.js",
  "bin": {
    "gulp": "bin/gulp.js"
  },
  "files": [
    "index.js",
    "lib",
    "bin",
    "completion",
    "gulp.1"
  ],
  "scripts": {
    "lint": "eslint .",
    "prepublish": "marked-man --name gulp docs/CLI.md > gulp.1",
    "pretest": "npm run lint",
    "test": "mocha --async-only --timeout 5000 test/lib test",
    "cover": "nyc --reporter=lcov --reporter=text-summary npm test",
    "coveralls": "nyc --reporter=text-lcov npm test | coveralls"
  },
  "dependencies": {
    "ansi-colors": "^1.0.1",
    "archy": "^1.0.0",
    "array-sort": "^1.0.0",
    "concat-stream": "^1.6.0",
    "color-support": "^1.1.3",
    "copy-props": "^2.0.1",
    "fancy-log": "^1.3.2",
    "gulplog": "^1.0.0",
    "interpret": "^1.4.0",
    "isobject": "^3.0.1",
    "liftoff": "^3.1.0",
    "matchdep": "^2.0.0",
    "mute-stdout": "^1.0.0",
    "pretty-hrtime": "^1.0.0",
    "replace-homedir": "^1.0.0",
    "semver-greatest-satisfied-range": "^1.1.0",
    "v8flags": "^3.2.0",
    "yargs": "^7.1.0"
  },
  "devDependencies": {
    "babel-preset-es2015": "^6.5.0",
    "babel-register": "^6.5.1",
    "coveralls": "^3.0.3",
    "eslint": "^2.13.1",
    "eslint-config-gulp": "^3.0.1",
    "expect": "^1.20.2",
    "gulp": "^4.0.0",
    "gulp-test-tools": "^0.6.1",
    "marked-man": "^0.2.1",
    "mocha": "^3.2.0",
    "nyc": "^13.3.0",
    "rimraf": "^2.6.1",
    "semver": "^5.7.1"
  },
  "keywords": [
    "build",
    "stream",
    "system",
    "make",
    "tool",
    "asset",
    "pipeline"
  ]
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070687, function(require, module, exports) {


var https = require('https');

var concat = require('concat-stream');

var url = 'https://raw.githubusercontent.com/gulpjs/plugins/master/src/blackList.json';

function collect(stream, cb) {
  stream.on('error', cb);
  stream.pipe(concat(onSuccess));

  function onSuccess(result) {
    cb(null, result);
  }
}

function parse(str, cb) {
  try {
    cb(null, JSON.parse(str));
  } catch (err) {
    /* istanbul ignore next */
    cb(new Error('Invalid Blacklist JSON.'));
  }
}

// TODO: Test this impl
function getBlacklist(cb) {
  https.get(url, onRequest);

  function onRequest(res) {
    /* istanbul ignore if */
    if (res.statusCode !== 200) {
      // TODO: Test different status codes
      return cb(new Error('Request failed. Status Code: ' + res.statusCode));
    }

    res.setEncoding('utf8');

    collect(res, onCollect);
  }

  function onCollect(err, result) {
    /* istanbul ignore if */
    if (err) {
      return cb(err);
    }

    parse(result, onParse);
  }

  function onParse(err, blacklist) {
    /* istanbul ignore if */
    if (err) {
      return cb(err);
    }

    cb(null, blacklist);
  }
}

module.exports = getBlacklist;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070688, function(require, module, exports) {


var fancyLog = require('fancy-log');

/* istanbul ignore next */
function noop() {}

// The sorting of the levels is
// significant.
var levels = [
  'error', // -L: Logs error events.
  'warn',  // -LL: Logs warn and error events.
  'info',  // -LLL: Logs info, warn and error events.
  'debug', // -LLLL: Logs all log levels.
];

function cleanup(log) {
  levels.forEach(removeListeners);

  function removeListeners(level) {
    if (level === 'error') {
      log.removeListener(level, noop);
      log.removeListener(level, fancyLog.error);
    } else {
      log.removeListener(level, fancyLog);
    }
  }
}

function toConsole(log, opts) {
  // Remove previous listeners to enable to call this twice.
  cleanup(log);

  // Return immediately if logging is
  // not desired.
  if (opts.tasksSimple || opts.tasksJson || opts.help || opts.version || opts.silent) {
    // Keep from crashing process when silent.
    log.on('error', noop);
    return;
  }

  // Default loglevel to info level (3).
  var loglevel = opts.logLevel || 3;

  levels
    .filter(function(item, i) {
      return i < loglevel;
    })
    .forEach(function(level) {
      if (level === 'error') {
        log.on(level, fancyLog.error);
      } else {
        log.on(level, fancyLog);
      }
    });
}

module.exports = toConsole;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070689, function(require, module, exports) {


var copyProps = require('copy-props');
var path = require('path');

function loadConfigFiles(configFiles, configFileOrder) {
  var config = {};

  configFileOrder.forEach(loadFile);

  function loadFile(key) {
    var filePath = configFiles[key];
    if (!filePath) {
      return;
    }

    copyProps(require(filePath), config, convert);

    function convert(loadedInfo) {
      if (loadedInfo.keyChain === 'flags.gulpfile') {
        return path.resolve(path.dirname(filePath), loadedInfo.value);
      }
      return loadedInfo.value;
    }
  }

  return config;
}

module.exports = loadConfigFiles;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070690, function(require, module, exports) {


var copyProps = require('copy-props');

var fromTo = {
  'flags.silent': 'silent',
  'flags.continue': 'continue',
  'flags.series': 'series',
  'flags.logLevel': 'logLevel',
  'flags.compactTasks': 'compactTasks',
  'flags.tasksDepth': 'tasksDepth',
  'flags.sortTasks': 'sortTasks',
};

function mergeConfigToCliFlags(opt, config) {
  return copyProps(config, opt, fromTo, defaults);
}

function defaults(cfgInfo, optInfo) {
  if (optInfo.value === undefined) {
    return cfgInfo.value;
  }
}

module.exports = mergeConfigToCliFlags;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070691, function(require, module, exports) {


var path = require('path');
var copyProps = require('copy-props');

var toFrom = {
  configPath: 'flags.gulpfile',
  configBase: 'flags.gulpfile',
  require: 'flags.require',
  nodeFlags: 'flags.nodeFlags',
};

function mergeConfigToEnvFlags(env, config, cliOpts) {
  // This must reverse because `flags.gulpfile` determines 2 different properties
  var reverse = true;
  return copyProps(env, config, toFrom, convert, reverse);

  function convert(configInfo, envInfo) {
    if (envInfo.keyChain === 'configBase') {
      if (cliOpts.gulpfile === undefined) {
        return path.dirname(configInfo.value);
      }
      return;
    }

    if (envInfo.keyChain === 'configPath') {
      if (cliOpts.gulpfile === undefined) {
        return configInfo.value;
      }
      return;
    }

    if (envInfo.keyChain === 'require') {
      return [].concat(envInfo.value, configInfo.value);
    }

    /* istanbul ignore else */
    if (envInfo.keyChain === 'nodeFlags') {
      return [].concat(configInfo.value || []);
    }
  }
}

module.exports = mergeConfigToEnvFlags;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070692, function(require, module, exports) {


var log = require('gulplog');

var ansi = require('../ansi');
var exit = require('../exit');

function logVerify(blacklisted) {
  var pluginNames = Object.keys(blacklisted);

  if (!pluginNames.length) {
    log.info(
      ansi.green('There are no blacklisted plugins in this project')
    );
    exit(0);
  }

  log.warn(ansi.red('Blacklisted plugins found in this project:'));

  pluginNames.map(function(pluginName) {
    var reason = blacklisted[pluginName];
    log.warn(ansi.bgred(pluginName) + ': ' + reason);
  });

  exit(1);
}

module.exports = logVerify;

}, function(modId) { var map = {"../ansi":1646378070679,"../exit":1646378070680}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070693, function(require, module, exports) {


var log = require('gulplog');

var ansi = require('../ansi');
var exit = require('../exit');

/* istanbul ignore next */
function logBlacklistError(err) {
  log.error(ansi.red('Error: failed to retrieve plugins black-list'));
  log.error(err.message); // Avoid duplicating for each version
  exit(1);
}

module.exports = logBlacklistError;

}, function(modId) { var map = {"../ansi":1646378070679,"../exit":1646378070680}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1646378070678);
})()
//miniprogram-npm-outsideDeps=["fs","path","gulplog","yargs","liftoff","interpret","v8flags","semver-greatest-satisfied-range","ansi-colors","color-support","replace-homedir","matchdep","https","concat-stream","fancy-log","copy-props"]
//# sourceMappingURL=index.js.map