module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1646378070154, function(require, module, exports) {
/*!
 * ansi-colors <https://github.com/doowb/ansi-colors>
 *
 * Copyright (c) 2015-2017, Brian Woodward.
 * Released under the MIT License.
 */



/**
 * Module dependencies
 */

var wrap = require('ansi-wrap');

/**
 * Wrap a string with ansi codes to create a black background.
 *
 * ```js
 * console.log(colors.bgblack('some string'));
 * ```
 *
 * @param  {string} message String to wrap with ansi codes.
 * @return {string} Wrapped string
 * @api public
 * @name  bgblack
 */

exports.bgblack = function bgblack(message) {
  return wrap(40, 49, message);
};

/**
 * Wrap a string with ansi codes to create a blue background.
 *
 * ```js
 * console.log(colors.bgblue('some string'));
 * ```
 *
 * @param  {string} message String to wrap with ansi codes.
 * @return {string} Wrapped string
 * @api public
 * @name  bgblue
 */

exports.bgblue = function bgblue(message) {
  return wrap(44, 49, message);
};

/**
 * Wrap a string with ansi codes to create a cyan background.
 *
 * ```js
 * console.log(colors.bgcyan('some string'));
 * ```
 *
 * @param  {string} message String to wrap with ansi codes.
 * @return {string} Wrapped string
 * @api public
 * @name  bgcyan
 */

exports.bgcyan = function bgcyan(message) {
  return wrap(46, 49, message);
};

/**
 * Wrap a string with ansi codes to create a green background.
 *
 * ```js
 * console.log(colors.bggreen('some string'));
 * ```
 *
 * @param  {string} message String to wrap with ansi codes.
 * @return {string} Wrapped string
 * @api public
 * @name  bggreen
 */

exports.bggreen = function bggreen(message) {
  return wrap(42, 49, message);
};

/**
 * Wrap a string with ansi codes to create a magenta background.
 *
 * ```js
 * console.log(colors.bgmagenta('some string'));
 * ```
 *
 * @param  {string} message String to wrap with ansi codes.
 * @return {string} Wrapped string
 * @api public
 * @name  bgmagenta
 */

exports.bgmagenta = function bgmagenta(message) {
  return wrap(45, 49, message);
};

/**
 * Wrap a string with ansi codes to create a red background.
 *
 * ```js
 * console.log(colors.bgred('some string'));
 * ```
 *
 * @param  {string} message String to wrap with ansi codes.
 * @return {string} Wrapped string
 * @api public
 * @name  bgred
 */

exports.bgred = function bgred(message) {
  return wrap(41, 49, message);
};

/**
 * Wrap a string with ansi codes to create a white background.
 *
 * ```js
 * console.log(colors.bgwhite('some string'));
 * ```
 *
 * @param  {string} message String to wrap with ansi codes.
 * @return {string} Wrapped string
 * @api public
 * @name  bgwhite
 */

exports.bgwhite = function bgwhite(message) {
  return wrap(47, 49, message);
};

/**
 * Wrap a string with ansi codes to create a yellow background.
 *
 * ```js
 * console.log(colors.bgyellow('some string'));
 * ```
 *
 * @param  {string} message String to wrap with ansi codes.
 * @return {string} Wrapped string
 * @api public
 * @name  bgyellow
 */

exports.bgyellow = function bgyellow(message) {
  return wrap(43, 49, message);
};

/**
 * Wrap a string with ansi codes to create black text.
 *
 * ```js
 * console.log(colors.black('some string'));
 * ```
 *
 * @param  {string} message String to wrap with ansi codes.
 * @return {string} Wrapped string
 * @api public
 * @name  black
 */

exports.black = function black(message) {
  return wrap(30, 39, message);
};

/**
 * Wrap a string with ansi codes to create blue text.
 *
 * ```js
 * console.log(colors.blue('some string'));
 * ```
 *
 * @param  {string} message String to wrap with ansi codes.
 * @return {string} Wrapped string
 * @api public
 * @name  blue
 */

exports.blue = function blue(message) {
  return wrap(34, 39, message);
};

/**
 * Wrap a string with ansi codes to create bold text.
 *
 * ```js
 * console.log(colors.bold('some string'));
 * ```
 *
 * @param  {string} message String to wrap with ansi codes.
 * @return {string} Wrapped string
 * @api public
 * @name  bold
 */

exports.bold = function bold(message) {
  return wrap(1, 22, message);
};

/**
 * Wrap a string with ansi codes to create cyan text.
 *
 * ```js
 * console.log(colors.cyan('some string'));
 * ```
 *
 * @param  {string} message String to wrap with ansi codes.
 * @return {string} Wrapped string
 * @api public
 * @name  cyan
 */

exports.cyan = function cyan(message) {
  return wrap(36, 39, message);
};

/**
 * Wrap a string with ansi codes to create dim text.
 *
 * ```js
 * console.log(colors.dim('some string'));
 * ```
 *
 * @param  {string} message String to wrap with ansi codes.
 * @return {string} Wrapped string
 * @api public
 * @name  dim
 */

exports.dim = function dim(message) {
  return wrap(2, 22, message);
};

/**
 * Wrap a string with ansi codes to create gray text.
 *
 * ```js
 * console.log(colors.gray('some string'));
 * ```
 *
 * @param  {string} message String to wrap with ansi codes.
 * @return {string} Wrapped string
 * @api public
 * @name  gray
 */

exports.gray = function gray(message) {
  return wrap(90, 39, message);
};

/**
 * Wrap a string with ansi codes to create green text.
 *
 * ```js
 * console.log(colors.green('some string'));
 * ```
 *
 * @param  {string} message String to wrap with ansi codes.
 * @return {string} Wrapped string
 * @api public
 * @name  green
 */

exports.green = function green(message) {
  return wrap(32, 39, message);
};

/**
 * Wrap a string with ansi codes to create grey text.
 *
 * ```js
 * console.log(colors.grey('some string'));
 * ```
 *
 * @param  {string} message String to wrap with ansi codes.
 * @return {string} Wrapped string
 * @api public
 * @name  grey
 */

exports.grey = function grey(message) {
  return wrap(90, 39, message);
};

/**
 * Wrap a string with ansi codes to create hidden text.
 *
 * ```js
 * console.log(colors.hidden('some string'));
 * ```
 *
 * @param  {string} message String to wrap with ansi codes.
 * @return {string} Wrapped string
 * @api public
 * @name  hidden
 */

exports.hidden = function hidden(message) {
  return wrap(8, 28, message);
};

/**
 * Wrap a string with ansi codes to create inverse text.
 *
 * ```js
 * console.log(colors.inverse('some string'));
 * ```
 *
 * @param  {string} message String to wrap with ansi codes.
 * @return {string} Wrapped string
 * @api public
 * @name  inverse
 */

exports.inverse = function inverse(message) {
  return wrap(7, 27, message);
};

/**
 * Wrap a string with ansi codes to create italic text.
 *
 * ```js
 * console.log(colors.italic('some string'));
 * ```
 *
 * @param  {string} message String to wrap with ansi codes.
 * @return {string} Wrapped string
 * @api public
 * @name  italic
 */

exports.italic = function italic(message) {
  return wrap(3, 23, message);
};

/**
 * Wrap a string with ansi codes to create magenta text.
 *
 * ```js
 * console.log(colors.magenta('some string'));
 * ```
 *
 * @param  {string} message String to wrap with ansi codes.
 * @return {string} Wrapped string
 * @api public
 * @name  magenta
 */

exports.magenta = function magenta(message) {
  return wrap(35, 39, message);
};

/**
 * Wrap a string with ansi codes to create red text.
 *
 * ```js
 * console.log(colors.red('some string'));
 * ```
 *
 * @param  {string} message String to wrap with ansi codes.
 * @return {string} Wrapped string
 * @api public
 * @name  red
 */

exports.red = function red(message) {
  return wrap(31, 39, message);
};

/**
 * Wrap a string with ansi codes to reset ansi colors currently on the string.
 *
 * ```js
 * console.log(colors.reset('some string'));
 * ```
 *
 * @param  {string} message String to wrap with ansi codes.
 * @return {string} Wrapped string
 * @api public
 * @name  reset
 */

exports.reset = function reset(message) {
  return wrap(0, 0, message);
};

/**
 * Wrap a string with ansi codes to add a strikethrough to the text.
 *
 * ```js
 * console.log(colors.strikethrough('some string'));
 * ```
 *
 * @param  {string} message String to wrap with ansi codes.
 * @return {string} Wrapped string
 * @api public
 * @name  strikethrough
 */

exports.strikethrough = function strikethrough(message) {
  return wrap(9, 29, message);
};

/**
 * Wrap a string with ansi codes to underline the text.
 *
 * ```js
 * console.log(colors.underline('some string'));
 * ```
 *
 * @param  {string} message String to wrap with ansi codes.
 * @return {string} Wrapped string
 * @api public
 * @name  underline
 */

exports.underline = function underline(message) {
  return wrap(4, 24, message);
};

/**
 * Wrap a string with ansi codes to create white text.
 *
 * ```js
 * console.log(colors.white('some string'));
 * ```
 *
 * @param  {string} message String to wrap with ansi codes.
 * @return {string} Wrapped string
 * @api public
 * @name  white
 */

exports.white = function white(message) {
  return wrap(37, 39, message);
};

/**
 * Wrap a string with ansi codes to create yellow text.
 *
 * ```js
 * console.log(colors.yellow('some string'));
 * ```
 *
 * @param  {string} message String to wrap with ansi codes.
 * @return {string} Wrapped string
 * @api public
 * @name  yellow
 */

exports.yellow = function yellow(message) {
  return wrap(33, 39, message);
};

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1646378070154);
})()
//miniprogram-npm-outsideDeps=["ansi-wrap"]
//# sourceMappingURL=index.js.map