module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1646378070645, function(require, module, exports) {
var reorder = require('./lib/reorder');
var respawn = require('./lib/respawn');
var remover = require('./lib/remover');

var FORBID_RESPAWNING_FLAG = '--no-respawning';

module.exports = function(flags, argv, forcedFlags, execute) {
  if (!flags) {
    throw new Error('You must specify flags to respawn with.');
  }
  if (!argv) {
    throw new Error('You must specify an argv array.');
  }

  if (typeof forcedFlags === 'function') {
    execute = forcedFlags;
    forcedFlags = [];
  }

  if (typeof forcedFlags === 'string') {
    forcedFlags = [forcedFlags];
  }

  if (!Array.isArray(forcedFlags)) {
    forcedFlags = [];
  }

  var index = argv.indexOf(FORBID_RESPAWNING_FLAG);
  if (index >= 0) {
    argv = argv.slice(0, index).concat(argv.slice(index + 1));
    argv = remover(flags, argv);
    execute(true, process, argv);
    return;
  }

  var proc = process;
  var reordered = reorder(flags, argv);
  var ready = JSON.stringify(argv) === JSON.stringify(reordered);

  if (forcedFlags.length) {
    reordered = reordered.slice(0, 1)
      .concat(forcedFlags)
      .concat(reordered.slice(1));
    ready = false;
  }

  if (!ready) {
    reordered.push(FORBID_RESPAWNING_FLAG);
    proc = respawn(reordered);
  }
  execute(ready, proc, reordered);
};

}, function(modId) {var map = {"./lib/reorder":1646378070646,"./lib/respawn":1646378070648,"./lib/remover":1646378070649}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070646, function(require, module, exports) {
var isV8flags = require('./is-v8flags');

module.exports = function(flags, argv) {
  if (!argv) {
    argv = process.argv;
  }
  var args = [argv[1]];
  argv.slice(2).forEach(function(arg) {
    var flag = arg.split('=')[0];
    if (isV8flags(flag, flags)) {
      args.unshift(arg);
    } else {
      args.push(arg);
    }
  });
  args.unshift(argv[0]);
  return args;
};

}, function(modId) { var map = {"./is-v8flags":1646378070647}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070647, function(require, module, exports) {
function isV8flags(flag, v8flags) {
  return v8flags.indexOf(replaceSeparatorsFromDashesToUnderscores(flag)) >= 0;
}

function replaceSeparatorsFromDashesToUnderscores(flag) {
  var arr = /^(-+)(.*)$/.exec(flag);
  if (!arr) {
    return flag;
  }
  return arr[1] + arr[2].replace(/\-/g, '_');
}

module.exports = isV8flags;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070648, function(require, module, exports) {
var spawn = require('child_process').spawn;

module.exports = function(argv) {
  var child = spawn(argv[0], argv.slice(1), { stdio: 'inherit' });
  child.on('exit', function(code, signal) {
    process.on('exit', function() {
      /* istanbul ignore if */
      if (signal) {
        process.kill(process.pid, signal);
      } else {
        process.exit(code);
      }
    });
  });
  return child;
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070649, function(require, module, exports) {
var isV8flags = require('./is-v8flags');

module.exports = function(flags, argv) {
  var args = argv.slice(0, 1);
  for (var i = 1, n = argv.length; i < n; i++) {
    var arg = argv[i];
    var flag = arg.split('=')[0];
    if (!isV8flags(flag, flags)) {
      args.push(arg);
    }
  }
  return args;
};

}, function(modId) { var map = {"./is-v8flags":1646378070647}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1646378070645);
})()
//miniprogram-npm-outsideDeps=["child_process"]
//# sourceMappingURL=index.js.map