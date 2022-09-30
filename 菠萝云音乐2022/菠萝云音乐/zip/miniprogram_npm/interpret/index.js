module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1646378070721, function(require, module, exports) {
var path = require('path');

var mjsStub = path.join(__dirname, 'mjs-stub');

var extensions = {
  '.babel.js': [
    {
      module: '@babel/register',
      register: function(hook) {
        // register on .js extension due to https://github.com/joyent/node/blob/v0.12.0/lib/module.js#L353
        // which only captures the final extension (.babel.js -> .js)
        hook({ extensions: '.js' });
      },
    },
    {
      module: 'babel-register',
      register: function(hook) {
        hook({ extensions: '.js' });
      },
    },
    {
      module: 'babel-core/register',
      register: function(hook) {
        hook({ extensions: '.js' });
      },
    },
    {
      module: 'babel/register',
      register: function(hook) {
        hook({ extensions: '.js' });
      },
    },
  ],
  '.babel.ts': [
    {
      module: '@babel/register',
      register: function(hook) {
        hook({ extensions: '.ts' });
      },
    },
  ],
  '.buble.js': 'buble/register',
  '.cirru': 'cirru-script/lib/register',
  '.cjsx': 'node-cjsx/register',
  '.co': 'coco',
  '.coffee': ['coffeescript/register', 'coffee-script/register', 'coffeescript', 'coffee-script'],
  '.coffee.md': ['coffeescript/register', 'coffee-script/register', 'coffeescript', 'coffee-script'],
  '.csv': 'require-csv',
  '.eg': 'earlgrey/register',
  '.esm.js': {
    module: 'esm',
    register: function(hook) {
      // register on .js extension due to https://github.com/joyent/node/blob/v0.12.0/lib/module.js#L353
      // which only captures the final extension (.babel.js -> .js)
      var esmLoader = hook(module);
      require.extensions['.js'] = esmLoader('module')._extensions['.js'];
    },
  },
  '.iced': ['iced-coffee-script/register', 'iced-coffee-script'],
  '.iced.md': 'iced-coffee-script/register',
  '.ini': 'require-ini',
  '.js': null,
  '.json': null,
  '.json5': 'json5/lib/require',
  '.jsx': [
    {
      module: '@babel/register',
      register: function(hook) {
        hook({ extensions: '.jsx' });
      },
    },
    {
      module: 'babel-register',
      register: function(hook) {
        hook({ extensions: '.jsx' });
      },
    },
    {
      module: 'babel-core/register',
      register: function(hook) {
        hook({ extensions: '.jsx' });
      },
    },
    {
      module: 'babel/register',
      register: function(hook) {
        hook({ extensions: '.jsx' });
      },
    },
    {
      module: 'node-jsx',
      register: function(hook) {
        hook.install({ extension: '.jsx', harmony: true });
      },
    },
  ],
  '.litcoffee': ['coffeescript/register', 'coffee-script/register', 'coffeescript', 'coffee-script'],
  '.liticed': 'iced-coffee-script/register',
  '.ls': ['livescript', 'LiveScript'],
  '.mjs': mjsStub,
  '.node': null,
  '.toml': {
    module: 'toml-require',
    register: function(hook) {
      hook.install();
    },
  },
  '.ts': [
    'ts-node/register',
    'typescript-node/register',
    'typescript-register',
    'typescript-require',
    'sucrase/register/ts',
    {
      module: '@babel/register',
      register: function(hook) {
        hook({ extensions: '.ts' });
      },
    },
  ],
  '.tsx': [
    'ts-node/register',
    'typescript-node/register',
    'sucrase/register',
    {
      module: '@babel/register',
      register: function(hook) {
        hook({ extensions: '.tsx' });
      },
    },
  ],
  '.wisp': 'wisp/engine/node',
  '.xml': 'require-xml',
  '.yaml': 'require-yaml',
  '.yml': 'require-yaml',
};

var jsVariantExtensions = [
  '.js',
  '.babel.js',
  '.babel.ts',
  '.buble.js',
  '.cirru',
  '.cjsx',
  '.co',
  '.coffee',
  '.coffee.md',
  '.eg',
  '.esm.js',
  '.iced',
  '.iced.md',
  '.jsx',
  '.litcoffee',
  '.liticed',
  '.ls',
  '.mjs',
  '.ts',
  '.tsx',
  '.wisp',
];

module.exports = {
  extensions: extensions,
  jsVariants: jsVariantExtensions.reduce(function(result, ext) {
    result[ext] = extensions[ext];
    return result;
  }, {}),
};

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1646378070721);
})()
//miniprogram-npm-outsideDeps=["path"]
//# sourceMappingURL=index.js.map