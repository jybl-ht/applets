module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1646378070672, function(require, module, exports) {
/*!
 * global-prefix <https://github.com/jonschlinkert/global-prefix>
 *
 * Copyright (c) 2015-2017 Jon Schlinkert.
 * Licensed under the MIT license.
 */



var fs = require('fs');
var path = require('path');
var expand = require('expand-tilde');
var homedir = require('homedir-polyfill');
var ini = require('ini');
var prefix;

function getPrefix() {
  if (process.env.PREFIX) {
    prefix = process.env.PREFIX;
  } else {
    // Start by checking if the global prefix is set by the user
    var home = homedir();
    if (home) {
      // homedir() returns undefined if $HOME not set; path.resolve requires strings
      var userConfig = path.resolve(home, '.npmrc');
      prefix = tryConfigPath(userConfig);
    }

    if (!prefix) {
      // Otherwise find the path of npm
      var npm = tryNpmPath();
      if (npm) {
        // Check the built-in npm config file
        var builtinConfig = path.resolve(npm, '..', '..', 'npmrc');
        prefix = tryConfigPath(builtinConfig);

        if (prefix) {
          // Now the global npm config can also be checked.
          var globalConfig = path.resolve(prefix, 'etc', 'npmrc');
          prefix = tryConfigPath(globalConfig) || prefix;
        }
      }

      if (!prefix) fallback();
    }
  }

  if (prefix) {
    return expand(prefix);
  }
}

function fallback() {
  var isWindows = require('is-windows');
  if (isWindows()) {
    // c:\node\node.exe --> prefix=c:\node\
    prefix = process.env.APPDATA
      ? path.join(process.env.APPDATA, 'npm')
      : path.dirname(process.execPath);
  } else {
    // /usr/local/bin/node --> prefix=/usr/local
    prefix = path.dirname(path.dirname(process.execPath));

    // destdir only is respected on Unix
    if (process.env.DESTDIR) {
      prefix = path.join(process.env.DESTDIR, prefix);
    }
  }
}

function tryNpmPath() {
  try {
    return fs.realpathSync(require('which').sync('npm'));
  } catch (err) {}
  return null;
}

function tryConfigPath(configPath) {
  try {
    var data = fs.readFileSync(configPath, 'utf-8');
    var config = ini.parse(data);
    if (config.prefix) return config.prefix;
  } catch (err) {}
  return null;
}

/**
 * Expose `prefix`
 */

Object.defineProperty(module, 'exports', {
  enumerable: true,
  get: function() {
    return prefix || (prefix = getPrefix());
  }
});

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1646378070672);
})()
//miniprogram-npm-outsideDeps=["fs","path","expand-tilde","homedir-polyfill","ini","is-windows","which"]
//# sourceMappingURL=index.js.map