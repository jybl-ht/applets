module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1646378070201, function(require, module, exports) {

var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var sysPath = require('path');
var asyncEach = require('async-each');
var anymatch = require('anymatch');
var globParent = require('glob-parent');
var isGlob = require('is-glob');
var isAbsolute = require('path-is-absolute');
var inherits = require('inherits');
var braces = require('braces');
var normalizePath = require('normalize-path');
var upath = require('upath');

var NodeFsHandler = require('./lib/nodefs-handler');
var FsEventsHandler = require('./lib/fsevents-handler');

var arrify = function(value) {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
};

var flatten = function(list, result) {
  if (result == null) result = [];
  list.forEach(function(item) {
    if (Array.isArray(item)) {
      flatten(item, result);
    } else {
      result.push(item);
    }
  });
  return result;
};

// Little isString util for use in Array#every.
var isString = function(thing) {
  return typeof thing === 'string';
};

// Public: Main class.
// Watches files & directories for changes.
//
// * _opts - object, chokidar options hash
//
// Emitted events:
// `add`, `addDir`, `change`, `unlink`, `unlinkDir`, `all`, `error`
//
// Examples
//
//  var watcher = new FSWatcher()
//    .add(directories)
//    .on('add', path => console.log('File', path, 'was added'))
//    .on('change', path => console.log('File', path, 'was changed'))
//    .on('unlink', path => console.log('File', path, 'was removed'))
//    .on('all', (event, path) => console.log(path, ' emitted ', event))
//
function FSWatcher(_opts) {
  EventEmitter.call(this);
  var opts = {};
  // in case _opts that is passed in is a frozen object
  if (_opts) for (var opt in _opts) opts[opt] = _opts[opt];
  this._watched = Object.create(null);
  this._closers = Object.create(null);
  this._ignoredPaths = Object.create(null);
  Object.defineProperty(this, '_globIgnored', {
    get: function() { return Object.keys(this._ignoredPaths); }
  });
  this.closed = false;
  this._throttled = Object.create(null);
  this._symlinkPaths = Object.create(null);

  function undef(key) {
    return opts[key] === undefined;
  }

  // Set up default options.
  if (undef('persistent')) opts.persistent = true;
  if (undef('ignoreInitial')) opts.ignoreInitial = false;
  if (undef('ignorePermissionErrors')) opts.ignorePermissionErrors = false;
  if (undef('interval')) opts.interval = 100;
  if (undef('binaryInterval')) opts.binaryInterval = 300;
  if (undef('disableGlobbing')) opts.disableGlobbing = false;
  this.enableBinaryInterval = opts.binaryInterval !== opts.interval;

  // Enable fsevents on OS X when polling isn't explicitly enabled.
  if (undef('useFsEvents')) opts.useFsEvents = !opts.usePolling;

  // If we can't use fsevents, ensure the options reflect it's disabled.
  if (!FsEventsHandler.canUse()) opts.useFsEvents = false;

  // Use polling on Mac if not using fsevents.
  // Other platforms use non-polling fs.watch.
  if (undef('usePolling') && !opts.useFsEvents) {
    opts.usePolling = process.platform === 'darwin';
  }

  // Global override (useful for end-developers that need to force polling for all
  // instances of chokidar, regardless of usage/dependency depth)
  var envPoll = process.env.CHOKIDAR_USEPOLLING;
  if (envPoll !== undefined) {
    var envLower = envPoll.toLowerCase();

    if (envLower === 'false' || envLower === '0') {
      opts.usePolling = false;
    } else if (envLower === 'true' || envLower === '1') {
      opts.usePolling = true;
    } else {
      opts.usePolling = !!envLower
    }
  }
  var envInterval = process.env.CHOKIDAR_INTERVAL;
  if (envInterval) {
    opts.interval = parseInt(envInterval);
  }

  // Editor atomic write normalization enabled by default with fs.watch
  if (undef('atomic')) opts.atomic = !opts.usePolling && !opts.useFsEvents;
  if (opts.atomic) this._pendingUnlinks = Object.create(null);

  if (undef('followSymlinks')) opts.followSymlinks = true;

  if (undef('awaitWriteFinish')) opts.awaitWriteFinish = false;
  if (opts.awaitWriteFinish === true) opts.awaitWriteFinish = {};
  var awf = opts.awaitWriteFinish;
  if (awf) {
    if (!awf.stabilityThreshold) awf.stabilityThreshold = 2000;
    if (!awf.pollInterval) awf.pollInterval = 100;

    this._pendingWrites = Object.create(null);
  }
  if (opts.ignored) opts.ignored = arrify(opts.ignored);

  this._isntIgnored = function(path, stat) {
    return !this._isIgnored(path, stat);
  }.bind(this);

  var readyCalls = 0;
  this._emitReady = function() {
    if (++readyCalls >= this._readyCount) {
      this._emitReady = Function.prototype;
      this._readyEmitted = true;
      // use process.nextTick to allow time for listener to be bound
      process.nextTick(this.emit.bind(this, 'ready'));
    }
  }.bind(this);

  this.options = opts;

  // You’re frozen when your heart’s not open.
  Object.freeze(opts);
}

inherits(FSWatcher, EventEmitter);

// Common helpers
// --------------

// Private method: Normalize and emit events
//
// * event     - string, type of event
// * path      - string, file or directory path
// * val[1..3] - arguments to be passed with event
//
// Returns the error if defined, otherwise the value of the
// FSWatcher instance's `closed` flag
FSWatcher.prototype._emit = function(event, path, val1, val2, val3) {
  if (this.options.cwd) path = sysPath.relative(this.options.cwd, path);
  var args = [event, path];
  if (val3 !== undefined) args.push(val1, val2, val3);
  else if (val2 !== undefined) args.push(val1, val2);
  else if (val1 !== undefined) args.push(val1);

  var awf = this.options.awaitWriteFinish;
  if (awf && this._pendingWrites[path]) {
    this._pendingWrites[path].lastChange = new Date();
    return this;
  }

  if (this.options.atomic) {
    if (event === 'unlink') {
      this._pendingUnlinks[path] = args;
      setTimeout(function() {
        Object.keys(this._pendingUnlinks).forEach(function(path) {
          this.emit.apply(this, this._pendingUnlinks[path]);
          this.emit.apply(this, ['all'].concat(this._pendingUnlinks[path]));
          delete this._pendingUnlinks[path];
        }.bind(this));
      }.bind(this), typeof this.options.atomic === "number"
        ? this.options.atomic
        : 100);
      return this;
    } else if (event === 'add' && this._pendingUnlinks[path]) {
      event = args[0] = 'change';
      delete this._pendingUnlinks[path];
    }
  }

  var emitEvent = function() {
    this.emit.apply(this, args);
    if (event !== 'error') this.emit.apply(this, ['all'].concat(args));
  }.bind(this);

  if (awf && (event === 'add' || event === 'change') && this._readyEmitted) {
    var awfEmit = function(err, stats) {
      if (err) {
        event = args[0] = 'error';
        args[1] = err;
        emitEvent();
      } else if (stats) {
        // if stats doesn't exist the file must have been deleted
        if (args.length > 2) {
          args[2] = stats;
        } else {
          args.push(stats);
        }
        emitEvent();
      }
    };

    this._awaitWriteFinish(path, awf.stabilityThreshold, event, awfEmit);
    return this;
  }

  if (event === 'change') {
    if (!this._throttle('change', path, 50)) return this;
  }

  if (
    this.options.alwaysStat && val1 === undefined &&
    (event === 'add' || event === 'addDir' || event === 'change')
  ) {
    var fullPath = this.options.cwd ? sysPath.join(this.options.cwd, path) : path;
    fs.stat(fullPath, function(error, stats) {
      // Suppress event when fs.stat fails, to avoid sending undefined 'stat'
      if (error || !stats) return;

      args.push(stats);
      emitEvent();
    });
  } else {
    emitEvent();
  }

  return this;
};

// Private method: Common handler for errors
//
// * error  - object, Error instance
//
// Returns the error if defined, otherwise the value of the
// FSWatcher instance's `closed` flag
FSWatcher.prototype._handleError = function(error) {
  var code = error && error.code;
  var ipe = this.options.ignorePermissionErrors;
  if (error &&
    code !== 'ENOENT' &&
    code !== 'ENOTDIR' &&
    (!ipe || (code !== 'EPERM' && code !== 'EACCES'))
  ) this.emit('error', error);
  return error || this.closed;
};

// Private method: Helper utility for throttling
//
// * action  - string, type of action being throttled
// * path    - string, path being acted upon
// * timeout - int, duration of time to suppress duplicate actions
//
// Returns throttle tracking object or false if action should be suppressed
FSWatcher.prototype._throttle = function(action, path, timeout) {
  if (!(action in this._throttled)) {
    this._throttled[action] = Object.create(null);
  }
  var throttled = this._throttled[action];
  if (path in throttled) {
    throttled[path].count++;
    return false;
  }
  function clear() {
    var count = throttled[path] ? throttled[path].count : 0;
    delete throttled[path];
    clearTimeout(timeoutObject);
    return count;
  }
  var timeoutObject = setTimeout(clear, timeout);
  throttled[path] = {timeoutObject: timeoutObject, clear: clear, count: 0};
  return throttled[path];
};

// Private method: Awaits write operation to finish
//
// * path    - string, path being acted upon
// * threshold - int, time in milliseconds a file size must be fixed before
//                    acknowledging write operation is finished
// * awfEmit - function, to be called when ready for event to be emitted
// Polls a newly created file for size variations. When files size does not
// change for 'threshold' milliseconds calls callback.
FSWatcher.prototype._awaitWriteFinish = function(path, threshold, event, awfEmit) {
  var timeoutHandler;

  var fullPath = path;
  if (this.options.cwd && !isAbsolute(path)) {
    fullPath = sysPath.join(this.options.cwd, path);
  }

  var now = new Date();

  var awaitWriteFinish = (function (prevStat) {
    fs.stat(fullPath, function(err, curStat) {
      if (err || !(path in this._pendingWrites)) {
        if (err && err.code !== 'ENOENT') awfEmit(err);
        return;
      }

      var now = new Date();

      if (prevStat && curStat.size != prevStat.size) {
        this._pendingWrites[path].lastChange = now;
      }

      if (now - this._pendingWrites[path].lastChange >= threshold) {
        delete this._pendingWrites[path];
        awfEmit(null, curStat);
      } else {
        timeoutHandler = setTimeout(
          awaitWriteFinish.bind(this, curStat),
          this.options.awaitWriteFinish.pollInterval
        );
      }
    }.bind(this));
  }.bind(this));

  if (!(path in this._pendingWrites)) {
    this._pendingWrites[path] = {
      lastChange: now,
      cancelWait: function() {
        delete this._pendingWrites[path];
        clearTimeout(timeoutHandler);
        return event;
      }.bind(this)
    };
    timeoutHandler = setTimeout(
      awaitWriteFinish.bind(this),
      this.options.awaitWriteFinish.pollInterval
    );
  }
};

// Private method: Determines whether user has asked to ignore this path
//
// * path  - string, path to file or directory
// * stats - object, result of fs.stat
//
// Returns boolean
var dotRe = /\..*\.(sw[px])$|\~$|\.subl.*\.tmp/;
FSWatcher.prototype._isIgnored = function(path, stats) {
  if (this.options.atomic && dotRe.test(path)) return true;

  if (!this._userIgnored) {
    var cwd = this.options.cwd;
    var ignored = this.options.ignored;
    if (cwd && ignored) {
      ignored = ignored.map(function (path) {
        if (typeof path !== 'string') return path;
        return upath.normalize(isAbsolute(path) ? path : sysPath.join(cwd, path));
      });
    }
    var paths = arrify(ignored)
      .filter(function(path) {
        return typeof path === 'string' && !isGlob(path);
      }).map(function(path) {
        return path + '/**';
      });
    this._userIgnored = anymatch(
      this._globIgnored.concat(ignored).concat(paths)
    );
  }

  return this._userIgnored([path, stats]);
};

// Private method: Provides a set of common helpers and properties relating to
// symlink and glob handling
//
// * path - string, file, directory, or glob pattern being watched
// * depth - int, at any depth > 0, this isn't a glob
//
// Returns object containing helpers for this path
var replacerRe = /^\.[\/\\]/;
FSWatcher.prototype._getWatchHelpers = function(path, depth) {
  path = path.replace(replacerRe, '');
  var watchPath = depth || this.options.disableGlobbing || !isGlob(path) ? path : globParent(path);
  var fullWatchPath = sysPath.resolve(watchPath);
  var hasGlob = watchPath !== path;
  var globFilter = hasGlob ? anymatch(path) : false;
  var follow = this.options.followSymlinks;
  var globSymlink = hasGlob && follow ? null : false;

  var checkGlobSymlink = function(entry) {
    // only need to resolve once
    // first entry should always have entry.parentDir === ''
    if (globSymlink == null) {
      globSymlink = entry.fullParentDir === fullWatchPath ? false : {
        realPath: entry.fullParentDir,
        linkPath: fullWatchPath
      };
    }

    if (globSymlink) {
      return entry.fullPath.replace(globSymlink.realPath, globSymlink.linkPath);
    }

    return entry.fullPath;
  };

  var entryPath = function(entry) {
    return sysPath.join(watchPath,
      sysPath.relative(watchPath, checkGlobSymlink(entry))
    );
  };

  var filterPath = function(entry) {
    if (entry.stat && entry.stat.isSymbolicLink()) return filterDir(entry);
    var resolvedPath = entryPath(entry);
    return (!hasGlob || globFilter(resolvedPath)) &&
      this._isntIgnored(resolvedPath, entry.stat) &&
      (this.options.ignorePermissionErrors ||
        this._hasReadPermissions(entry.stat));
  }.bind(this);

  var getDirParts = function(path) {
    if (!hasGlob) return false;
    var parts = [];
    var expandedPath = braces.expand(path);
    expandedPath.forEach(function(path) {
      parts.push(sysPath.relative(watchPath, path).split(/[\/\\]/));
    });
    return parts;
  };

  var dirParts = getDirParts(path);
  if (dirParts) {
    dirParts.forEach(function(parts) {
      if (parts.length > 1) parts.pop();
    });
  }
  var unmatchedGlob;

  var filterDir = function(entry) {
    if (hasGlob) {
      var entryParts = getDirParts(checkGlobSymlink(entry));
      var globstar = false;
      unmatchedGlob = !dirParts.some(function(parts) {
        return parts.every(function(part, i) {
          if (part === '**') globstar = true;
          return globstar || !entryParts[0][i] || anymatch(part, entryParts[0][i]);
        });
      });
    }
    return !unmatchedGlob && this._isntIgnored(entryPath(entry), entry.stat);
  }.bind(this);

  return {
    followSymlinks: follow,
    statMethod: follow ? 'stat' : 'lstat',
    path: path,
    watchPath: watchPath,
    entryPath: entryPath,
    hasGlob: hasGlob,
    globFilter: globFilter,
    filterPath: filterPath,
    filterDir: filterDir
  };
};

// Directory helpers
// -----------------

// Private method: Provides directory tracking objects
//
// * directory - string, path of the directory
//
// Returns the directory's tracking object
FSWatcher.prototype._getWatchedDir = function(directory) {
  var dir = sysPath.resolve(directory);
  var watcherRemove = this._remove.bind(this);
  if (!(dir in this._watched)) this._watched[dir] = {
    _items: Object.create(null),
    add: function(item) {
      if (item !== '.' && item !== '..') this._items[item] = true;
    },
    remove: function(item) {
      delete this._items[item];
      if (!this.children().length) {
        fs.readdir(dir, function(err) {
          if (err) watcherRemove(sysPath.dirname(dir), sysPath.basename(dir));
        });
      }
    },
    has: function(item) {return item in this._items;},
    children: function() {return Object.keys(this._items);}
  };
  return this._watched[dir];
};

// File helpers
// ------------

// Private method: Check for read permissions
// Based on this answer on SO: http://stackoverflow.com/a/11781404/1358405
//
// * stats - object, result of fs.stat
//
// Returns boolean
FSWatcher.prototype._hasReadPermissions = function(stats) {
  return Boolean(4 & parseInt(((stats && stats.mode) & 0x1ff).toString(8)[0], 10));
};

// Private method: Handles emitting unlink events for
// files and directories, and via recursion, for
// files and directories within directories that are unlinked
//
// * directory - string, directory within which the following item is located
// * item      - string, base path of item/directory
//
// Returns nothing
FSWatcher.prototype._remove = function(directory, item) {
  // if what is being deleted is a directory, get that directory's paths
  // for recursive deleting and cleaning of watched object
  // if it is not a directory, nestedDirectoryChildren will be empty array
  var path = sysPath.join(directory, item);
  var fullPath = sysPath.resolve(path);
  var isDirectory = this._watched[path] || this._watched[fullPath];

  // prevent duplicate handling in case of arriving here nearly simultaneously
  // via multiple paths (such as _handleFile and _handleDir)
  if (!this._throttle('remove', path, 100)) return;

  // if the only watched file is removed, watch for its return
  var watchedDirs = Object.keys(this._watched);
  if (!isDirectory && !this.options.useFsEvents && watchedDirs.length === 1) {
    this.add(directory, item, true);
  }

  // This will create a new entry in the watched object in either case
  // so we got to do the directory check beforehand
  var nestedDirectoryChildren = this._getWatchedDir(path).children();

  // Recursively remove children directories / files.
  nestedDirectoryChildren.forEach(function(nestedItem) {
    this._remove(path, nestedItem);
  }, this);

  // Check if item was on the watched list and remove it
  var parent = this._getWatchedDir(directory);
  var wasTracked = parent.has(item);
  parent.remove(item);

  // If we wait for this file to be fully written, cancel the wait.
  var relPath = path;
  if (this.options.cwd) relPath = sysPath.relative(this.options.cwd, path);
  if (this.options.awaitWriteFinish && this._pendingWrites[relPath]) {
    var event = this._pendingWrites[relPath].cancelWait();
    if (event === 'add') return;
  }

  // The Entry will either be a directory that just got removed
  // or a bogus entry to a file, in either case we have to remove it
  delete this._watched[path];
  delete this._watched[fullPath];
  var eventName = isDirectory ? 'unlinkDir' : 'unlink';
  if (wasTracked && !this._isIgnored(path)) this._emit(eventName, path);

  // Avoid conflicts if we later create another file with the same name
  if (!this.options.useFsEvents) {
    this._closePath(path);
  }
};

FSWatcher.prototype._closePath = function(path) {
  if (!this._closers[path]) return;
  this._closers[path].forEach(function(closer) {
    closer();
  });
  delete this._closers[path];
  this._getWatchedDir(sysPath.dirname(path)).remove(sysPath.basename(path));
}

// Public method: Adds paths to be watched on an existing FSWatcher instance

// * paths     - string or array of strings, file/directory paths and/or globs
// * _origAdd  - private boolean, for handling non-existent paths to be watched
// * _internal - private boolean, indicates a non-user add

// Returns an instance of FSWatcher for chaining.
FSWatcher.prototype.add = function(paths, _origAdd, _internal) {
  var disableGlobbing = this.options.disableGlobbing;
  var cwd = this.options.cwd;
  this.closed = false;
  paths = flatten(arrify(paths));

  if (!paths.every(isString)) {
    throw new TypeError('Non-string provided as watch path: ' + paths);
  }

  if (cwd) paths = paths.map(function(path) {
    var absPath;
    if (isAbsolute(path)) {
      absPath = path;
    } else if (path[0] === '!') {
      absPath = '!' + sysPath.join(cwd, path.substring(1));
    } else {
      absPath = sysPath.join(cwd, path);
    }

    // Check `path` instead of `absPath` because the cwd portion can't be a glob
    if (disableGlobbing || !isGlob(path)) {
      return absPath;
    } else {
      return normalizePath(absPath);
    }
  });

  // set aside negated glob strings
  paths = paths.filter(function(path) {
    if (path[0] === '!') {
      this._ignoredPaths[path.substring(1)] = true;
    } else {
      // if a path is being added that was previously ignored, stop ignoring it
      delete this._ignoredPaths[path];
      delete this._ignoredPaths[path + '/**'];

      // reset the cached userIgnored anymatch fn
      // to make ignoredPaths changes effective
      this._userIgnored = null;

      return true;
    }
  }, this);

  if (this.options.useFsEvents && FsEventsHandler.canUse()) {
    if (!this._readyCount) this._readyCount = paths.length;
    if (this.options.persistent) this._readyCount *= 2;
    paths.forEach(this._addToFsEvents, this);
  } else {
    if (!this._readyCount) this._readyCount = 0;
    this._readyCount += paths.length;
    asyncEach(paths, function(path, next) {
      this._addToNodeFs(path, !_internal, 0, 0, _origAdd, function(err, res) {
        if (res) this._emitReady();
        next(err, res);
      }.bind(this));
    }.bind(this), function(error, results) {
      results.forEach(function(item) {
        if (!item || this.closed) return;
        this.add(sysPath.dirname(item), sysPath.basename(_origAdd || item));
      }, this);
    }.bind(this));
  }

  return this;
};

// Public method: Close watchers or start ignoring events from specified paths.

// * paths     - string or array of strings, file/directory paths and/or globs

// Returns instance of FSWatcher for chaining.
FSWatcher.prototype.unwatch = function(paths) {
  if (this.closed) return this;
  paths = flatten(arrify(paths));

  paths.forEach(function(path) {
    // convert to absolute path unless relative path already matches
    if (!isAbsolute(path) && !this._closers[path]) {
      if (this.options.cwd) path = sysPath.join(this.options.cwd, path);
      path = sysPath.resolve(path);
    }

    this._closePath(path);

    this._ignoredPaths[path] = true;
    if (path in this._watched) {
      this._ignoredPaths[path + '/**'] = true;
    }

    // reset the cached userIgnored anymatch fn
    // to make ignoredPaths changes effective
    this._userIgnored = null;
  }, this);

  return this;
};

// Public method: Close watchers and remove all listeners from watched paths.

// Returns instance of FSWatcher for chaining.
FSWatcher.prototype.close = function() {
  if (this.closed) return this;

  this.closed = true;
  Object.keys(this._closers).forEach(function(watchPath) {
    this._closers[watchPath].forEach(function(closer) {
      closer();
    });
    delete this._closers[watchPath];
  }, this);
  this._watched = Object.create(null);

  this.removeAllListeners();
  return this;
};

// Public method: Expose list of watched paths

// Returns object w/ dir paths as keys and arrays of contained paths as values.
FSWatcher.prototype.getWatched = function() {
  var watchList = {};
  Object.keys(this._watched).forEach(function(dir) {
    var key = this.options.cwd ? sysPath.relative(this.options.cwd, dir) : dir;
    watchList[key || '.'] = Object.keys(this._watched[dir]._items).sort();
  }.bind(this));
  return watchList;
};

// Attach watch handler prototype methods
function importHandler(handler) {
  Object.keys(handler.prototype).forEach(function(method) {
    FSWatcher.prototype[method] = handler.prototype[method];
  });
}
importHandler(NodeFsHandler);
if (FsEventsHandler.canUse()) importHandler(FsEventsHandler);

// Export FSWatcher class
exports.FSWatcher = FSWatcher;

// Public function: Instantiates watcher with paths to be tracked.

// * paths     - string or array of strings, file/directory paths and/or globs
// * options   - object, chokidar options

// Returns an instance of FSWatcher for chaining.
exports.watch = function(paths, options) {
  return new FSWatcher(options).add(paths);
};

}, function(modId) {var map = {"./lib/nodefs-handler":1646378070202,"./lib/fsevents-handler":1646378070203}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070202, function(require, module, exports) {


var fs = require('fs');
var sysPath = require('path');
var readdirp = require('readdirp');
var isBinaryPath = require('is-binary-path');

// fs.watch helpers

// object to hold per-process fs.watch instances
// (may be shared across chokidar FSWatcher instances)
var FsWatchInstances = Object.create(null);


// Private function: Instantiates the fs.watch interface

// * path       - string, path to be watched
// * options    - object, options to be passed to fs.watch
// * listener   - function, main event handler
// * errHandler - function, handler which emits info about errors
// * emitRaw    - function, handler which emits raw event data

// Returns new fsevents instance
function createFsWatchInstance(path, options, listener, errHandler, emitRaw) {
  var handleEvent = function(rawEvent, evPath) {
    listener(path);
    emitRaw(rawEvent, evPath, {watchedPath: path});

    // emit based on events occurring for files from a directory's watcher in
    // case the file's watcher misses it (and rely on throttling to de-dupe)
    if (evPath && path !== evPath) {
      fsWatchBroadcast(
        sysPath.resolve(path, evPath), 'listeners', sysPath.join(path, evPath)
      );
    }
  };
  try {
    return fs.watch(path, options, handleEvent);
  } catch (error) {
    errHandler(error);
  }
}

// Private function: Helper for passing fs.watch event data to a
// collection of listeners

// * fullPath   - string, absolute path bound to the fs.watch instance
// * type       - string, listener type
// * val[1..3]  - arguments to be passed to listeners

// Returns nothing
function fsWatchBroadcast(fullPath, type, val1, val2, val3) {
  if (!FsWatchInstances[fullPath]) return;
  FsWatchInstances[fullPath][type].forEach(function(listener) {
    listener(val1, val2, val3);
  });
}

// Private function: Instantiates the fs.watch interface or binds listeners
// to an existing one covering the same file system entry

// * path       - string, path to be watched
// * fullPath   - string, absolute path
// * options    - object, options to be passed to fs.watch
// * handlers   - object, container for event listener functions

// Returns close function
function setFsWatchListener(path, fullPath, options, handlers) {
  var listener = handlers.listener;
  var errHandler = handlers.errHandler;
  var rawEmitter = handlers.rawEmitter;
  var container = FsWatchInstances[fullPath];
  var watcher;
  if (!options.persistent) {
    watcher = createFsWatchInstance(
      path, options, listener, errHandler, rawEmitter
    );
    return watcher.close.bind(watcher);
  }
  if (!container) {
    watcher = createFsWatchInstance(
      path,
      options,
      fsWatchBroadcast.bind(null, fullPath, 'listeners'),
      errHandler, // no need to use broadcast here
      fsWatchBroadcast.bind(null, fullPath, 'rawEmitters')
    );
    if (!watcher) return;
    var broadcastErr = fsWatchBroadcast.bind(null, fullPath, 'errHandlers');
    watcher.on('error', function(error) {
      container.watcherUnusable = true; // documented since Node 10.4.1
      // Workaround for https://github.com/joyent/node/issues/4337
      if (process.platform === 'win32' && error.code === 'EPERM') {
        fs.open(path, 'r', function(err, fd) {
          if (!err) fs.close(fd, function(err) {
            if (!err) broadcastErr(error);
          });
        });
      } else {
        broadcastErr(error);
      }
    });
    container = FsWatchInstances[fullPath] = {
      listeners: [listener],
      errHandlers: [errHandler],
      rawEmitters: [rawEmitter],
      watcher: watcher
    };
  } else {
    container.listeners.push(listener);
    container.errHandlers.push(errHandler);
    container.rawEmitters.push(rawEmitter);
  }
  var listenerIndex = container.listeners.length - 1;

  // removes this instance's listeners and closes the underlying fs.watch
  // instance if there are no more listeners left
  return function close() {
    delete container.listeners[listenerIndex];
    delete container.errHandlers[listenerIndex];
    delete container.rawEmitters[listenerIndex];
    if (!Object.keys(container.listeners).length) {
      if (!container.watcherUnusable) { // check to protect against issue #730
        container.watcher.close();
      }
      delete FsWatchInstances[fullPath];
    }
  };
}

// fs.watchFile helpers

// object to hold per-process fs.watchFile instances
// (may be shared across chokidar FSWatcher instances)
var FsWatchFileInstances = Object.create(null);

// Private function: Instantiates the fs.watchFile interface or binds listeners
// to an existing one covering the same file system entry

// * path       - string, path to be watched
// * fullPath   - string, absolute path
// * options    - object, options to be passed to fs.watchFile
// * handlers   - object, container for event listener functions

// Returns close function
function setFsWatchFileListener(path, fullPath, options, handlers) {
  var listener = handlers.listener;
  var rawEmitter = handlers.rawEmitter;
  var container = FsWatchFileInstances[fullPath];
  var listeners = [];
  var rawEmitters = [];
  if (
    container && (
      container.options.persistent < options.persistent ||
      container.options.interval > options.interval
    )
  ) {
    // "Upgrade" the watcher to persistence or a quicker interval.
    // This creates some unlikely edge case issues if the user mixes
    // settings in a very weird way, but solving for those cases
    // doesn't seem worthwhile for the added complexity.
    listeners = container.listeners;
    rawEmitters = container.rawEmitters;
    fs.unwatchFile(fullPath);
    container = false;
  }
  if (!container) {
    listeners.push(listener);
    rawEmitters.push(rawEmitter);
    container = FsWatchFileInstances[fullPath] = {
      listeners: listeners,
      rawEmitters: rawEmitters,
      options: options,
      watcher: fs.watchFile(fullPath, options, function(curr, prev) {
        container.rawEmitters.forEach(function(rawEmitter) {
          rawEmitter('change', fullPath, {curr: curr, prev: prev});
        });
        var currmtime = curr.mtime.getTime();
        if (curr.size !== prev.size || currmtime > prev.mtime.getTime() || currmtime === 0) {
          container.listeners.forEach(function(listener) {
            listener(path, curr);
          });
        }
      })
    };
  } else {
    container.listeners.push(listener);
    container.rawEmitters.push(rawEmitter);
  }
  var listenerIndex = container.listeners.length - 1;

  // removes this instance's listeners and closes the underlying fs.watchFile
  // instance if there are no more listeners left
  return function close() {
    delete container.listeners[listenerIndex];
    delete container.rawEmitters[listenerIndex];
    if (!Object.keys(container.listeners).length) {
      fs.unwatchFile(fullPath);
      delete FsWatchFileInstances[fullPath];
    }
  };
}

// fake constructor for attaching nodefs-specific prototype methods that
// will be copied to FSWatcher's prototype
function NodeFsHandler() {}

// Private method: Watch file for changes with fs.watchFile or fs.watch.

// * path     - string, path to file or directory.
// * listener - function, to be executed on fs change.

// Returns close function for the watcher instance
NodeFsHandler.prototype._watchWithNodeFs =
function(path, listener) {
  var directory = sysPath.dirname(path);
  var basename = sysPath.basename(path);
  var parent = this._getWatchedDir(directory);
  parent.add(basename);
  var absolutePath = sysPath.resolve(path);
  var options = {persistent: this.options.persistent};
  if (!listener) listener = Function.prototype; // empty function

  var closer;
  if (this.options.usePolling) {
    options.interval = this.enableBinaryInterval && isBinaryPath(basename) ?
      this.options.binaryInterval : this.options.interval;
    closer = setFsWatchFileListener(path, absolutePath, options, {
      listener: listener,
      rawEmitter: this.emit.bind(this, 'raw')
    });
  } else {
    closer = setFsWatchListener(path, absolutePath, options, {
      listener: listener,
      errHandler: this._handleError.bind(this),
      rawEmitter: this.emit.bind(this, 'raw')
    });
  }
  return closer;
};

// Private method: Watch a file and emit add event if warranted

// * file       - string, the file's path
// * stats      - object, result of fs.stat
// * initialAdd - boolean, was the file added at watch instantiation?
// * callback   - function, called when done processing as a newly seen file

// Returns close function for the watcher instance
NodeFsHandler.prototype._handleFile =
function(file, stats, initialAdd, callback) {
  var dirname = sysPath.dirname(file);
  var basename = sysPath.basename(file);
  var parent = this._getWatchedDir(dirname);
  // stats is always present
  var prevStats = stats;

  // if the file is already being watched, do nothing
  if (parent.has(basename)) return callback();

  // kick off the watcher
  var closer = this._watchWithNodeFs(file, function(path, newStats) {
    if (!this._throttle('watch', file, 5)) return;
    if (!newStats || newStats && newStats.mtime.getTime() === 0) {
      fs.stat(file, function(error, newStats) {
        // Fix issues where mtime is null but file is still present
        if (error) {
          this._remove(dirname, basename);
        } else {
          // Check that change event was not fired because of changed only accessTime.
          var at = newStats.atime.getTime();
          var mt = newStats.mtime.getTime();
          if (!at || at <= mt || mt !== prevStats.mtime.getTime()) {
            this._emit('change', file, newStats);
          }
          prevStats = newStats;
        }
      }.bind(this));
    // add is about to be emitted if file not already tracked in parent
    } else if (parent.has(basename)) {
      // Check that change event was not fired because of changed only accessTime.
      var at = newStats.atime.getTime();
      var mt = newStats.mtime.getTime();
      if (!at || at <= mt ||  mt !== prevStats.mtime.getTime()) {
        this._emit('change', file, newStats);
      }
      prevStats = newStats;
    }
  }.bind(this));

  // emit an add event if we're supposed to
  if (!(initialAdd && this.options.ignoreInitial)) {
    if (!this._throttle('add', file, 0)) return;
    this._emit('add', file, stats);
  }

  if (callback) callback();
  return closer;
};

// Private method: Handle symlinks encountered while reading a dir

// * entry      - object, entry object returned by readdirp
// * directory  - string, path of the directory being read
// * path       - string, path of this item
// * item       - string, basename of this item

// Returns true if no more processing is needed for this entry.
NodeFsHandler.prototype._handleSymlink =
function(entry, directory, path, item) {
  var full = entry.fullPath;
  var dir = this._getWatchedDir(directory);

  if (!this.options.followSymlinks) {
    // watch symlink directly (don't follow) and detect changes
    this._readyCount++;
    fs.realpath(path, function(error, linkPath) {
      if (dir.has(item)) {
        if (this._symlinkPaths[full] !== linkPath) {
          this._symlinkPaths[full] = linkPath;
          this._emit('change', path, entry.stat);
        }
      } else {
        dir.add(item);
        this._symlinkPaths[full] = linkPath;
        this._emit('add', path, entry.stat);
      }
      this._emitReady();
    }.bind(this));
    return true;
  }

  // don't follow the same symlink more than once
  if (this._symlinkPaths[full]) return true;
  else this._symlinkPaths[full] = true;
};

// Private method: Read directory to add / remove files from `@watched` list
// and re-read it on change.

// * dir        - string, fs path.
// * stats      - object, result of fs.stat
// * initialAdd - boolean, was the file added at watch instantiation?
// * depth      - int, depth relative to user-supplied path
// * target     - string, child path actually targeted for watch
// * wh         - object, common watch helpers for this path
// * callback   - function, called when dir scan is complete

// Returns close function for the watcher instance
NodeFsHandler.prototype._handleDir =
function(dir, stats, initialAdd, depth, target, wh, callback) {
  var parentDir = this._getWatchedDir(sysPath.dirname(dir));
  var tracked = parentDir.has(sysPath.basename(dir));
  if (!(initialAdd && this.options.ignoreInitial) && !target && !tracked) {
    if (!wh.hasGlob || wh.globFilter(dir)) this._emit('addDir', dir, stats);
  }

  // ensure dir is tracked (harmless if redundant)
  parentDir.add(sysPath.basename(dir));
  this._getWatchedDir(dir);

  var read = function(directory, initialAdd, done) {
    // Normalize the directory name on Windows
    directory = sysPath.join(directory, '');

    if (!wh.hasGlob) {
      var throttler = this._throttle('readdir', directory, 1000);
      if (!throttler) return;
    }

    var previous = this._getWatchedDir(wh.path);
    var current = [];

    readdirp({
      root: directory,
      entryType: 'all',
      fileFilter: wh.filterPath,
      directoryFilter: wh.filterDir,
      depth: 0,
      lstat: true
    }).on('data', function(entry) {
      var item = entry.path;
      var path = sysPath.join(directory, item);
      current.push(item);

      if (entry.stat.isSymbolicLink() &&
        this._handleSymlink(entry, directory, path, item)) return;

      // Files that present in current directory snapshot
      // but absent in previous are added to watch list and
      // emit `add` event.
      if (item === target || !target && !previous.has(item)) {
        this._readyCount++;

        // ensure relativeness of path is preserved in case of watcher reuse
        path = sysPath.join(dir, sysPath.relative(dir, path));

        this._addToNodeFs(path, initialAdd, wh, depth + 1);
      }
    }.bind(this)).on('end', function() {
      var wasThrottled = throttler ? throttler.clear() : false;
      if (done) done();

      // Files that absent in current directory snapshot
      // but present in previous emit `remove` event
      // and are removed from @watched[directory].
      previous.children().filter(function(item) {
        return item !== directory &&
          current.indexOf(item) === -1 &&
          // in case of intersecting globs;
          // a path may have been filtered out of this readdir, but
          // shouldn't be removed because it matches a different glob
          (!wh.hasGlob || wh.filterPath({
            fullPath: sysPath.resolve(directory, item)
          }));
      }).forEach(function(item) {
        this._remove(directory, item);
      }, this);

      // one more time for any missed in case changes came in extremely quickly
      if (wasThrottled) read(directory, false);
    }.bind(this)).on('error', this._handleError.bind(this));
  }.bind(this);

  var closer;

  if (this.options.depth == null || depth <= this.options.depth) {
    if (!target) read(dir, initialAdd, callback);
    closer = this._watchWithNodeFs(dir, function(dirPath, stats) {
      // if current directory is removed, do nothing
      if (stats && stats.mtime.getTime() === 0) return;

      read(dirPath, false);
    });
  } else {
    callback();
  }
  return closer;
};

// Private method: Handle added file, directory, or glob pattern.
// Delegates call to _handleFile / _handleDir after checks.

// * path       - string, path to file or directory.
// * initialAdd - boolean, was the file added at watch instantiation?
// * depth      - int, depth relative to user-supplied path
// * target     - string, child path actually targeted for watch
// * callback   - function, indicates whether the path was found or not

// Returns nothing
NodeFsHandler.prototype._addToNodeFs =
function(path, initialAdd, priorWh, depth, target, callback) {
  if (!callback) callback = Function.prototype;
  var ready = this._emitReady;
  if (this._isIgnored(path) || this.closed) {
    ready();
    return callback(null, false);
  }

  var wh = this._getWatchHelpers(path, depth);
  if (!wh.hasGlob && priorWh) {
    wh.hasGlob = priorWh.hasGlob;
    wh.globFilter = priorWh.globFilter;
    wh.filterPath = priorWh.filterPath;
    wh.filterDir = priorWh.filterDir;
  }

  // evaluate what is at the path we're being asked to watch
  fs[wh.statMethod](wh.watchPath, function(error, stats) {
    if (this._handleError(error)) return callback(null, path);
    if (this._isIgnored(wh.watchPath, stats)) {
      ready();
      return callback(null, false);
    }

    var initDir = function(dir, target) {
      return this._handleDir(dir, stats, initialAdd, depth, target, wh, ready);
    }.bind(this);

    var closer;
    if (stats.isDirectory()) {
      closer = initDir(wh.watchPath, target);
    } else if (stats.isSymbolicLink()) {
      var parent = sysPath.dirname(wh.watchPath);
      this._getWatchedDir(parent).add(wh.watchPath);
      this._emit('add', wh.watchPath, stats);
      closer = initDir(parent, path);

      // preserve this symlink's target path
      fs.realpath(path, function(error, targetPath) {
        this._symlinkPaths[sysPath.resolve(path)] = targetPath;
        ready();
      }.bind(this));
    } else {
      closer = this._handleFile(wh.watchPath, stats, initialAdd, ready);
    }

    if (closer) {
      this._closers[path] = this._closers[path] || [];
      this._closers[path].push(closer);
    }
    callback(null, false);
  }.bind(this));
};

module.exports = NodeFsHandler;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1646378070203, function(require, module, exports) {


var fs = require('fs');
var sysPath = require('path');
var readdirp = require('readdirp');
var fsevents;
try { fsevents = require('fsevents'); } catch (error) {
  if (process.env.CHOKIDAR_PRINT_FSEVENTS_REQUIRE_ERROR) console.error(error)
}

// fsevents instance helper functions

// object to hold per-process fsevents instances
// (may be shared across chokidar FSWatcher instances)
var FSEventsWatchers = Object.create(null);

// Threshold of duplicate path prefixes at which to start
// consolidating going forward
var consolidateThreshhold = 10;

// Private function: Instantiates the fsevents interface

// * path       - string, path to be watched
// * callback   - function, called when fsevents is bound and ready

// Returns new fsevents instance
function createFSEventsInstance(path, callback) {
  return (new fsevents(path)).on('fsevent', callback).start();
}

// Private function: Instantiates the fsevents interface or binds listeners
// to an existing one covering the same file tree

// * path       - string, path to be watched
// * realPath   - string, real path (in case of symlinks)
// * listener   - function, called when fsevents emits events
// * rawEmitter - function, passes data to listeners of the 'raw' event

// Returns close function
function setFSEventsListener(path, realPath, listener, rawEmitter) {
  var watchPath = sysPath.extname(path) ? sysPath.dirname(path) : path;
  var watchContainer;
  var parentPath = sysPath.dirname(watchPath);

  // If we've accumulated a substantial number of paths that
  // could have been consolidated by watching one directory
  // above the current one, create a watcher on the parent
  // path instead, so that we do consolidate going forward.
  if (couldConsolidate(parentPath)) {
    watchPath = parentPath;
  }

  var resolvedPath = sysPath.resolve(path);
  var hasSymlink = resolvedPath !== realPath;
  function filteredListener(fullPath, flags, info) {
    if (hasSymlink) fullPath = fullPath.replace(realPath, resolvedPath);
    if (
      fullPath === resolvedPath ||
      !fullPath.indexOf(resolvedPath + sysPath.sep)
    ) listener(fullPath, flags, info);
  }

  // check if there is already a watcher on a parent path
  // modifies `watchPath` to the parent path when it finds a match
  function watchedParent() {
    return Object.keys(FSEventsWatchers).some(function(watchedPath) {
      // condition is met when indexOf returns 0
      if (!realPath.indexOf(sysPath.resolve(watchedPath) + sysPath.sep)) {
        watchPath = watchedPath;
        return true;
      }
    });
  }

  if (watchPath in FSEventsWatchers || watchedParent()) {
    watchContainer = FSEventsWatchers[watchPath];
    watchContainer.listeners.push(filteredListener);
  } else {
    watchContainer = FSEventsWatchers[watchPath] = {
      listeners: [filteredListener],
      rawEmitters: [rawEmitter],
      watcher: createFSEventsInstance(watchPath, function(fullPath, flags) {
        var info = fsevents.getInfo(fullPath, flags);
        watchContainer.listeners.forEach(function(listener) {
          listener(fullPath, flags, info);
        });
        watchContainer.rawEmitters.forEach(function(emitter) {
          emitter(info.event, fullPath, info);
        });
      })
    };
  }
  var listenerIndex = watchContainer.listeners.length - 1;

  // removes this instance's listeners and closes the underlying fsevents
  // instance if there are no more listeners left
  return function close() {
    delete watchContainer.listeners[listenerIndex];
    delete watchContainer.rawEmitters[listenerIndex];
    if (!Object.keys(watchContainer.listeners).length) {
      watchContainer.watcher.stop();
      delete FSEventsWatchers[watchPath];
    }
  };
}

// Decide whether or not we should start a new higher-level
// parent watcher
function couldConsolidate(path) {
  var keys = Object.keys(FSEventsWatchers);
  var count = 0;

  for (var i = 0, len = keys.length; i < len; ++i) {
    var watchPath = keys[i];
    if (watchPath.indexOf(path) === 0) {
      count++;
      if (count >= consolidateThreshhold) {
        return true;
      }
    }
  }

  return false;
}

function isConstructor(obj) {
  return obj.prototype !== undefined && obj.prototype.constructor !== undefined;
}

// returns boolean indicating whether fsevents can be used
function canUse() {
  return fsevents && Object.keys(FSEventsWatchers).length < 128 && isConstructor(fsevents);
}

// determines subdirectory traversal levels from root to path
function depth(path, root) {
  var i = 0;
  while (!path.indexOf(root) && (path = sysPath.dirname(path)) !== root) i++;
  return i;
}

// fake constructor for attaching fsevents-specific prototype methods that
// will be copied to FSWatcher's prototype
function FsEventsHandler() {}

// Private method: Handle symlinks encountered during directory scan

// * watchPath  - string, file/dir path to be watched with fsevents
// * realPath   - string, real path (in case of symlinks)
// * transform  - function, path transformer
// * globFilter - function, path filter in case a glob pattern was provided

// Returns close function for the watcher instance
FsEventsHandler.prototype._watchWithFsEvents =
function(watchPath, realPath, transform, globFilter) {
  if (this._isIgnored(watchPath)) return;
  var watchCallback = function(fullPath, flags, info) {
    if (
      this.options.depth !== undefined &&
      depth(fullPath, realPath) > this.options.depth
    ) return;
    var path = transform(sysPath.join(
      watchPath, sysPath.relative(watchPath, fullPath)
    ));
    if (globFilter && !globFilter(path)) return;
    // ensure directories are tracked
    var parent = sysPath.dirname(path);
    var item = sysPath.basename(path);
    var watchedDir = this._getWatchedDir(
      info.type === 'directory' ? path : parent
    );
    var checkIgnored = function(stats) {
      if (this._isIgnored(path, stats)) {
        this._ignoredPaths[path] = true;
        if (stats && stats.isDirectory()) {
          this._ignoredPaths[path + '/**/*'] = true;
        }
        return true;
      } else {
        delete this._ignoredPaths[path];
        delete this._ignoredPaths[path + '/**/*'];
      }
    }.bind(this);

    var handleEvent = function(event) {
      if (checkIgnored()) return;

      if (event === 'unlink') {
        // suppress unlink events on never before seen files
        if (info.type === 'directory' || watchedDir.has(item)) {
          this._remove(parent, item);
        }
      } else {
        if (event === 'add') {
          // track new directories
          if (info.type === 'directory') this._getWatchedDir(path);

          if (info.type === 'symlink' && this.options.followSymlinks) {
            // push symlinks back to the top of the stack to get handled
            var curDepth = this.options.depth === undefined ?
              undefined : depth(fullPath, realPath) + 1;
            return this._addToFsEvents(path, false, true, curDepth);
          } else {
            // track new paths
            // (other than symlinks being followed, which will be tracked soon)
            this._getWatchedDir(parent).add(item);
          }
        }
        var eventName = info.type === 'directory' ? event + 'Dir' : event;
        this._emit(eventName, path);
        if (eventName === 'addDir') this._addToFsEvents(path, false, true);
      }
    }.bind(this);

    function addOrChange() {
      handleEvent(watchedDir.has(item) ? 'change' : 'add');
    }
    function checkFd() {
      fs.open(path, 'r', function(error, fd) {
        if (error) {
          error.code !== 'EACCES' ?
            handleEvent('unlink') : addOrChange();
        } else {
          fs.close(fd, function(err) {
            err && err.code !== 'EACCES' ?
              handleEvent('unlink') : addOrChange();
          });
        }
      });
    }
    // correct for wrong events emitted
    var wrongEventFlags = [
      69888, 70400, 71424, 72704, 73472, 131328, 131840, 262912
    ];
    if (wrongEventFlags.indexOf(flags) !== -1 || info.event === 'unknown') {
      if (typeof this.options.ignored === 'function') {
        fs.stat(path, function(error, stats) {
          if (checkIgnored(stats)) return;
          stats ? addOrChange() : handleEvent('unlink');
        });
      } else {
        checkFd();
      }
    } else {
      switch (info.event) {
      case 'created':
      case 'modified':
        return addOrChange();
      case 'deleted':
      case 'moved':
        return checkFd();
      }
    }
  }.bind(this);

  var closer = setFSEventsListener(
    watchPath,
    realPath,
    watchCallback,
    this.emit.bind(this, 'raw')
  );

  this._emitReady();
  return closer;
};

// Private method: Handle symlinks encountered during directory scan

// * linkPath   - string, path to symlink
// * fullPath   - string, absolute path to the symlink
// * transform  - function, pre-existing path transformer
// * curDepth   - int, level of subdirectories traversed to where symlink is

// Returns nothing
FsEventsHandler.prototype._handleFsEventsSymlink =
function(linkPath, fullPath, transform, curDepth) {
  // don't follow the same symlink more than once
  if (this._symlinkPaths[fullPath]) return;
  else this._symlinkPaths[fullPath] = true;

  this._readyCount++;

  fs.realpath(linkPath, function(error, linkTarget) {
    if (this._handleError(error) || this._isIgnored(linkTarget)) {
      return this._emitReady();
    }

    this._readyCount++;

    // add the linkTarget for watching with a wrapper for transform
    // that causes emitted paths to incorporate the link's path
    this._addToFsEvents(linkTarget || linkPath, function(path) {
      var dotSlash = '.' + sysPath.sep;
      var aliasedPath = linkPath;
      if (linkTarget && linkTarget !== dotSlash) {
        aliasedPath = path.replace(linkTarget, linkPath);
      } else if (path !== dotSlash) {
        aliasedPath = sysPath.join(linkPath, path);
      }
      return transform(aliasedPath);
    }, false, curDepth);
  }.bind(this));
};

// Private method: Handle added path with fsevents

// * path       - string, file/directory path or glob pattern
// * transform  - function, converts working path to what the user expects
// * forceAdd   - boolean, ensure add is emitted
// * priorDepth - int, level of subdirectories already traversed

// Returns nothing
FsEventsHandler.prototype._addToFsEvents =
function(path, transform, forceAdd, priorDepth) {

  // applies transform if provided, otherwise returns same value
  var processPath = typeof transform === 'function' ?
    transform : function(val) { return val; };

  var emitAdd = function(newPath, stats) {
    var pp = processPath(newPath);
    var isDir = stats.isDirectory();
    var dirObj = this._getWatchedDir(sysPath.dirname(pp));
    var base = sysPath.basename(pp);

    // ensure empty dirs get tracked
    if (isDir) this._getWatchedDir(pp);

    if (dirObj.has(base)) return;
    dirObj.add(base);

    if (!this.options.ignoreInitial || forceAdd === true) {
      this._emit(isDir ? 'addDir' : 'add', pp, stats);
    }
  }.bind(this);

  var wh = this._getWatchHelpers(path);

  // evaluate what is at the path we're being asked to watch
  fs[wh.statMethod](wh.watchPath, function(error, stats) {
    if (this._handleError(error) || this._isIgnored(wh.watchPath, stats)) {
      this._emitReady();
      return this._emitReady();
    }

    if (stats.isDirectory()) {
      // emit addDir unless this is a glob parent
      if (!wh.globFilter) emitAdd(processPath(path), stats);

      // don't recurse further if it would exceed depth setting
      if (priorDepth && priorDepth > this.options.depth) return;

      // scan the contents of the dir
      readdirp({
        root: wh.watchPath,
        entryType: 'all',
        fileFilter: wh.filterPath,
        directoryFilter: wh.filterDir,
        lstat: true,
        depth: this.options.depth - (priorDepth || 0)
      }).on('data', function(entry) {
        // need to check filterPath on dirs b/c filterDir is less restrictive
        if (entry.stat.isDirectory() && !wh.filterPath(entry)) return;

        var joinedPath = sysPath.join(wh.watchPath, entry.path);
        var fullPath = entry.fullPath;

        if (wh.followSymlinks && entry.stat.isSymbolicLink()) {
          // preserve the current depth here since it can't be derived from
          // real paths past the symlink
          var curDepth = this.options.depth === undefined ?
            undefined : depth(joinedPath, sysPath.resolve(wh.watchPath)) + 1;

          this._handleFsEventsSymlink(joinedPath, fullPath, processPath, curDepth);
        } else {
          emitAdd(joinedPath, entry.stat);
        }
      }.bind(this)).on('error', function() {
        // Ignore readdirp errors
      }).on('end', this._emitReady);
    } else {
      emitAdd(wh.watchPath, stats);
      this._emitReady();
    }
  }.bind(this));

  if (this.options.persistent && forceAdd !== true) {
    var initWatch = function(error, realPath) {
      if (this.closed) return;
      var closer = this._watchWithFsEvents(
        wh.watchPath,
        sysPath.resolve(realPath || wh.watchPath),
        processPath,
        wh.globFilter
      );
      if (closer) {
        this._closers[path] = this._closers[path] || [];
        this._closers[path].push(closer);
      }
    }.bind(this);

    if (typeof transform === 'function') {
      // realpath has already been resolved
      initWatch();
    } else {
      fs.realpath(wh.watchPath, initWatch);
    }
  }
};

module.exports = FsEventsHandler;
module.exports.canUse = canUse;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1646378070201);
})()
//miniprogram-npm-outsideDeps=["events","fs","path","async-each","anymatch","glob-parent","is-glob","path-is-absolute","inherits","braces","normalize-path","upath","readdirp","is-binary-path","fsevents"]
//# sourceMappingURL=index.js.map