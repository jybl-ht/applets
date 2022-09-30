module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1646378070226, function(require, module, exports) {


var eachProps = require('each-props');
var isPlainObject = require('is-plain-object').isPlainObject;

module.exports = function(src, dst, fromto, converter, reverse) {

  if (!isObject(src)) {
    src = {};
  }

  if (!isObject(dst)) {
    dst = {};
  }

  if (isPlainObject(fromto)) {
    fromto = onlyValueIsString(fromto);
  } else if (Array.isArray(fromto)) {
    fromto = arrayToObject(fromto);
  } else if (typeof fromto === 'boolean') {
    reverse = fromto;
    converter = noop;
    fromto = null;
  } else if (typeof fromto === 'function') {
    reverse = converter;
    converter = fromto;
    fromto = null;
  } else {
    fromto = null;
  }

  if (typeof converter !== 'function') {
    if (typeof converter === 'boolean') {
      reverse = converter;
      converter = noop;
    } else {
      converter = noop;
    }
  }

  if (typeof reverse !== 'boolean') {
    reverse = false;
  }

  if (reverse) {
    var tmp = src;
    src = dst;
    dst = tmp;

    if (fromto) {
      fromto = invert(fromto);
    }
  }

  var opts = {
    dest: dst,
    fromto: fromto,
    convert: converter,
  };

  if (fromto) {
    eachProps(src, copyWithFromto, opts);
    setParentEmptyObject(dst, fromto);
  } else {
    eachProps(src, copyWithoutFromto, opts);
  }

  return dst;
};

function copyWithFromto(value, keyChain, nodeInfo) {
  if (isPlainObject(value)) {
    return;
  }

  var dstKeyChains = nodeInfo.fromto[keyChain];
  if (!dstKeyChains) {
    return;
  }
  delete nodeInfo.fromto[keyChain];

  if (!Array.isArray(dstKeyChains)) {
    dstKeyChains = [dstKeyChains];
  }

  var srcInfo = {
    keyChain: keyChain,
    value: value,
    key: nodeInfo.name,
    depth: nodeInfo.depth,
    parent: nodeInfo.parent,
  };

  for (var i = 0, n = dstKeyChains.length; i < n; i++) {
    setDeep(nodeInfo.dest, dstKeyChains[i], function(parent, key, depth) {
      var dstInfo = {
        keyChain: dstKeyChains[i],
        value: parent[key],
        key: key,
        depth: depth,
        parent: parent,
      };

      return nodeInfo.convert(srcInfo, dstInfo);
    });
  }
}

function copyWithoutFromto(value, keyChain, nodeInfo) {
  if (isPlainObject(value)) {
    for (var k in value) {
      return;
    }
    setDeep(nodeInfo.dest, keyChain, newObject);
    return;
  }

  var srcInfo = {
    keyChain: keyChain,
    value: value,
    key: nodeInfo.name,
    depth: nodeInfo.depth,
    parent: nodeInfo.parent,
  };

  setDeep(nodeInfo.dest, keyChain, function(parent, key, depth) {
    var dstInfo = {
      keyChain: keyChain,
      value: parent[key],
      key: key,
      depth: depth,
      parent: parent,
    };

    return nodeInfo.convert(srcInfo, dstInfo);
  });
}

function newObject() {
  return {};
}

function noop(srcInfo) {
  return srcInfo.value;
}

function onlyValueIsString(obj) {
  var newObj = {};
  for (var key in obj) {
    var val = obj[key];
    if (typeof val === 'string') {
      newObj[key] = val;
    }
  }
  return newObj;
}

function arrayToObject(arr) {
  var obj = {};
  for (var i = 0, n = arr.length; i < n; i++) {
    var elm = arr[i];
    if (typeof elm === 'string') {
      obj[elm] = elm;
    }
  }
  return obj;
}

function invert(fromto) {
  var inv = {};
  for (var key in fromto) {
    var val = fromto[key];
    if (!inv[val]) {
      inv[val] = [];
    }
    inv[val].push(key);
  }
  return inv;
}

function setDeep(obj, keyChain, valueCreator) {
  _setDeep(obj, keyChain.split('.'), 1, valueCreator);
}

function _setDeep(obj, keyElems, depth, valueCreator) {
  var key = keyElems.shift();
  if (isPossibilityOfPrototypePollution(key)) {
    return;
  }

  if (!keyElems.length) {
    var value = valueCreator(obj, key, depth);
    if (value === undefined) {
      return;
    }
    if (isPlainObject(value)) { // value is always an empty object.
      if (isPlainObject(obj[key])) {
        return;
      }
    }
    obj[key] = value;
    return;
  }

  if (!isPlainObject(obj[key])) {
    obj[key] = {};
  }
  _setDeep(obj[key], keyElems, depth + 1, valueCreator);
}

function setParentEmptyObject(obj, fromto) {
  for (var srcKeyChain in fromto) {
    var dstKeyChains = fromto[srcKeyChain];
    if (!Array.isArray(dstKeyChains)) {
      dstKeyChains = [dstKeyChains];
    }

    for (var i = 0, n = dstKeyChains.length; i < n; i++) {
      setDeep(obj, dstKeyChains[i], newUndefined);
    }
  }
}

function newUndefined() {
  return undefined;
}

function isObject(v) {
  return Object.prototype.toString.call(v) === '[object Object]';
}

function isPossibilityOfPrototypePollution(key) {
  return (key === '__proto__' || key === 'constructor');
}

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1646378070226);
})()
//miniprogram-npm-outsideDeps=["each-props","is-plain-object"]
//# sourceMappingURL=index.js.map