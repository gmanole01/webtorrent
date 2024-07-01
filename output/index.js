'use strict';

var EventEmitter = require('events');
var path = require('path');
var createTorrent = require('create-torrent');
var debugFactory = require('debug');
var bittorrentDht = require('bittorrent-dht');
var loadIPSet = require('load-ip-set');
var parallel = require('run-parallel');
var parseTorrent = require('parse-torrent');
var Peer$1 = require('@thaunknown/simple-peer/lite.js');
var queueMicrotask = require('queue-microtask');
var uint8Util = require('uint8-util');
var throughput = require('throughput');
var speedLimiter = require('speed-limiter');
var NatAPI = require('@silentbot1/nat-api');
var net = require('net');
var streamx = require('streamx');
var arrayRemove = require('unordered-array-remove');
var Wire = require('bittorrent-protocol');
var fs = require('fs');
var os = require('os');
var addrToIPPort = require('addr-to-ip-port');
var BitField = require('bitfield');
var CacheChunkStore = require('cache-chunk-store');
var chunkStoreIterator = require('chunk-store-iterator');
var cpus = require('cpus');
var Discovery = require('torrent-discovery');
var FSChunkStore = require('fs-chunk-store');
var fetch$1 = require('cross-fetch-ponyfill');
var ImmediateChunkStore = require('immediate-chunk-store');
var ltDontHave = require('lt_donthave');
var MemoryChunkStore = require('memory-chunk-store');
var joinIterator = require('join-async-iterator');
var parallelLimit = require('run-parallel-limit');
var Piece = require('torrent-piece');
var randomIterate = require('random-iterate');
var utMetadata = require('ut_metadata');
var utPex = require('ut_pex');
var mime = require('mime/lite.js');
var once = require('once');
var http = require('http');
var escapeHtml = require('escape-html');
var pump = require('pump');
var rangeParser = require('range-parser');

function _OverloadYield(e, d) {
  this.v = e, this.k = d;
}
function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function _arrayWithHoles(r) {
  if (Array.isArray(r)) return r;
}
function _arrayWithoutHoles(r) {
  if (Array.isArray(r)) return _arrayLikeToArray(r);
}
function _assertThisInitialized(e) {
  if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  return e;
}
function _asyncIterator(r) {
  var n,
    t,
    o,
    e = 2;
  for ("undefined" != typeof Symbol && (t = Symbol.asyncIterator, o = Symbol.iterator); e--;) {
    if (t && null != (n = r[t])) return n.call(r);
    if (o && null != (n = r[o])) return new AsyncFromSyncIterator(n.call(r));
    t = "@@asyncIterator", o = "@@iterator";
  }
  throw new TypeError("Object is not async iterable");
}
function AsyncFromSyncIterator(r) {
  function AsyncFromSyncIteratorContinuation(r) {
    if (Object(r) !== r) return Promise.reject(new TypeError(r + " is not an object."));
    var n = r.done;
    return Promise.resolve(r.value).then(function (r) {
      return {
        value: r,
        done: n
      };
    });
  }
  return AsyncFromSyncIterator = function (r) {
    this.s = r, this.n = r.next;
  }, AsyncFromSyncIterator.prototype = {
    s: null,
    n: null,
    next: function () {
      return AsyncFromSyncIteratorContinuation(this.n.apply(this.s, arguments));
    },
    return: function (r) {
      var n = this.s.return;
      return void 0 === n ? Promise.resolve({
        value: r,
        done: !0
      }) : AsyncFromSyncIteratorContinuation(n.apply(this.s, arguments));
    },
    throw: function (r) {
      var n = this.s.return;
      return void 0 === n ? Promise.reject(r) : AsyncFromSyncIteratorContinuation(n.apply(this.s, arguments));
    }
  }, new AsyncFromSyncIterator(r);
}
function asyncGeneratorStep(n, t, e, r, o, a, c) {
  try {
    var i = n[a](c),
      u = i.value;
  } catch (n) {
    return void e(n);
  }
  i.done ? t(u) : Promise.resolve(u).then(r, o);
}
function _asyncToGenerator(n) {
  return function () {
    var t = this,
      e = arguments;
    return new Promise(function (r, o) {
      var a = n.apply(t, e);
      function _next(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, "next", n);
      }
      function _throw(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, "throw", n);
      }
      _next(void 0);
    });
  };
}
function _callSuper(t, o, e) {
  return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e));
}
function _classCallCheck(a, n) {
  if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
}
function _defineProperties(e, r) {
  for (var t = 0; t < r.length; t++) {
    var o = r[t];
    o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o);
  }
}
function _createClass(e, r, t) {
  return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
    writable: !1
  }), e;
}
function _createForOfIteratorHelper(r, e) {
  var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (!t) {
    if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e  ) {
      t && (r = t);
      var n = 0,
        F = function () {};
      return {
        s: F,
        n: function () {
          return n >= r.length ? {
            done: !0
          } : {
            done: !1,
            value: r[n++]
          };
        },
        e: function (r) {
          throw r;
        },
        f: F
      };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var o,
    a = !0,
    u = !1;
  return {
    s: function () {
      t = t.call(r);
    },
    n: function () {
      var r = t.next();
      return a = r.done, r;
    },
    e: function (r) {
      u = !0, o = r;
    },
    f: function () {
      try {
        a || null == t.return || t.return();
      } finally {
        if (u) throw o;
      }
    }
  };
}
function _defineProperty(e, r, t) {
  return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[r] = t, e;
}
function _get() {
  return _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function (e, t, r) {
    var p = _superPropBase(e, t);
    if (p) {
      var n = Object.getOwnPropertyDescriptor(p, t);
      return n.get ? n.get.call(arguments.length < 3 ? e : r) : n.value;
    }
  }, _get.apply(null, arguments);
}
function _getPrototypeOf(t) {
  return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) {
    return t.__proto__ || Object.getPrototypeOf(t);
  }, _getPrototypeOf(t);
}
function _inherits(t, e) {
  if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function");
  t.prototype = Object.create(e && e.prototype, {
    constructor: {
      value: t,
      writable: !0,
      configurable: !0
    }
  }), Object.defineProperty(t, "prototype", {
    writable: !1
  }), e && _setPrototypeOf(t, e);
}
function _isNativeReflectConstruct() {
  try {
    var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
  } catch (t) {}
  return (_isNativeReflectConstruct = function () {
    return !!t;
  })();
}
function _iterableToArray(r) {
  if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
}
function _iterableToArrayLimit(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e,
      n,
      i,
      u,
      a = [],
      f = !0,
      o = !1;
    try {
      if (i = (t = t.call(r)).next, 0 === l) ; else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
    } catch (r) {
      o = !0, n = r;
    } finally {
      try {
        if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function (r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), !0).forEach(function (r) {
      _defineProperty(e, r, t[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
    });
  }
  return e;
}
function _possibleConstructorReturn(t, e) {
  if (e && ("object" == typeof e || "function" == typeof e)) return e;
  if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined");
  return _assertThisInitialized(t);
}
function _regeneratorRuntime() {
  _regeneratorRuntime = function () {
    return e;
  };
  var t,
    e = {},
    r = Object.prototype,
    n = r.hasOwnProperty,
    o = Object.defineProperty || function (t, e, r) {
      t[e] = r.value;
    },
    i = "function" == typeof Symbol ? Symbol : {},
    a = i.iterator || "@@iterator",
    c = i.asyncIterator || "@@asyncIterator",
    u = i.toStringTag || "@@toStringTag";
  function define(t, e, r) {
    return Object.defineProperty(t, e, {
      value: r,
      enumerable: !0,
      configurable: !0,
      writable: !0
    }), t[e];
  }
  try {
    define({}, "");
  } catch (t) {
    define = function (t, e, r) {
      return t[e] = r;
    };
  }
  function wrap(t, e, r, n) {
    var i = e && e.prototype instanceof Generator ? e : Generator,
      a = Object.create(i.prototype),
      c = new Context(n || []);
    return o(a, "_invoke", {
      value: makeInvokeMethod(t, r, c)
    }), a;
  }
  function tryCatch(t, e, r) {
    try {
      return {
        type: "normal",
        arg: t.call(e, r)
      };
    } catch (t) {
      return {
        type: "throw",
        arg: t
      };
    }
  }
  e.wrap = wrap;
  var h = "suspendedStart",
    l = "suspendedYield",
    f = "executing",
    s = "completed",
    y = {};
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  var p = {};
  define(p, a, function () {
    return this;
  });
  var d = Object.getPrototypeOf,
    v = d && d(d(values([])));
  v && v !== r && n.call(v, a) && (p = v);
  var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p);
  function defineIteratorMethods(t) {
    ["next", "throw", "return"].forEach(function (e) {
      define(t, e, function (t) {
        return this._invoke(e, t);
      });
    });
  }
  function AsyncIterator(t, e) {
    function invoke(r, o, i, a) {
      var c = tryCatch(t[r], t, o);
      if ("throw" !== c.type) {
        var u = c.arg,
          h = u.value;
        return h && "object" == typeof h && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) {
          invoke("next", t, i, a);
        }, function (t) {
          invoke("throw", t, i, a);
        }) : e.resolve(h).then(function (t) {
          u.value = t, i(u);
        }, function (t) {
          return invoke("throw", t, i, a);
        });
      }
      a(c.arg);
    }
    var r;
    o(this, "_invoke", {
      value: function (t, n) {
        function callInvokeWithMethodAndArg() {
          return new e(function (e, r) {
            invoke(t, n, e, r);
          });
        }
        return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
      }
    });
  }
  function makeInvokeMethod(e, r, n) {
    var o = h;
    return function (i, a) {
      if (o === f) throw Error("Generator is already running");
      if (o === s) {
        if ("throw" === i) throw a;
        return {
          value: t,
          done: !0
        };
      }
      for (n.method = i, n.arg = a;;) {
        var c = n.delegate;
        if (c) {
          var u = maybeInvokeDelegate(c, n);
          if (u) {
            if (u === y) continue;
            return u;
          }
        }
        if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) {
          if (o === h) throw o = s, n.arg;
          n.dispatchException(n.arg);
        } else "return" === n.method && n.abrupt("return", n.arg);
        o = f;
        var p = tryCatch(e, r, n);
        if ("normal" === p.type) {
          if (o = n.done ? s : l, p.arg === y) continue;
          return {
            value: p.arg,
            done: n.done
          };
        }
        "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg);
      }
    };
  }
  function maybeInvokeDelegate(e, r) {
    var n = r.method,
      o = e.iterator[n];
    if (o === t) return r.delegate = null, "throw" === n && e.iterator.return && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y;
    var i = tryCatch(o, e.iterator, r.arg);
    if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y;
    var a = i.arg;
    return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y);
  }
  function pushTryEntry(t) {
    var e = {
      tryLoc: t[0]
    };
    1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e);
  }
  function resetTryEntry(t) {
    var e = t.completion || {};
    e.type = "normal", delete e.arg, t.completion = e;
  }
  function Context(t) {
    this.tryEntries = [{
      tryLoc: "root"
    }], t.forEach(pushTryEntry, this), this.reset(!0);
  }
  function values(e) {
    if (e || "" === e) {
      var r = e[a];
      if (r) return r.call(e);
      if ("function" == typeof e.next) return e;
      if (!isNaN(e.length)) {
        var o = -1,
          i = function next() {
            for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next;
            return next.value = t, next.done = !0, next;
          };
        return i.next = i;
      }
    }
    throw new TypeError(typeof e + " is not iterable");
  }
  return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", {
    value: GeneratorFunctionPrototype,
    configurable: !0
  }), o(GeneratorFunctionPrototype, "constructor", {
    value: GeneratorFunction,
    configurable: !0
  }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) {
    var e = "function" == typeof t && t.constructor;
    return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name));
  }, e.mark = function (t) {
    return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t;
  }, e.awrap = function (t) {
    return {
      __await: t
    };
  }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () {
    return this;
  }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) {
    void 0 === i && (i = Promise);
    var a = new AsyncIterator(wrap(t, r, n, o), i);
    return e.isGeneratorFunction(r) ? a : a.next().then(function (t) {
      return t.done ? t.value : a.next();
    });
  }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () {
    return this;
  }), define(g, "toString", function () {
    return "[object Generator]";
  }), e.keys = function (t) {
    var e = Object(t),
      r = [];
    for (var n in e) r.push(n);
    return r.reverse(), function next() {
      for (; r.length;) {
        var t = r.pop();
        if (t in e) return next.value = t, next.done = !1, next;
      }
      return next.done = !0, next;
    };
  }, e.values = values, Context.prototype = {
    constructor: Context,
    reset: function (e) {
      if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t);
    },
    stop: function () {
      this.done = !0;
      var t = this.tryEntries[0].completion;
      if ("throw" === t.type) throw t.arg;
      return this.rval;
    },
    dispatchException: function (e) {
      if (this.done) throw e;
      var r = this;
      function handle(n, o) {
        return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o;
      }
      for (var o = this.tryEntries.length - 1; o >= 0; --o) {
        var i = this.tryEntries[o],
          a = i.completion;
        if ("root" === i.tryLoc) return handle("end");
        if (i.tryLoc <= this.prev) {
          var c = n.call(i, "catchLoc"),
            u = n.call(i, "finallyLoc");
          if (c && u) {
            if (this.prev < i.catchLoc) return handle(i.catchLoc, !0);
            if (this.prev < i.finallyLoc) return handle(i.finallyLoc);
          } else if (c) {
            if (this.prev < i.catchLoc) return handle(i.catchLoc, !0);
          } else {
            if (!u) throw Error("try statement without catch or finally");
            if (this.prev < i.finallyLoc) return handle(i.finallyLoc);
          }
        }
      }
    },
    abrupt: function (t, e) {
      for (var r = this.tryEntries.length - 1; r >= 0; --r) {
        var o = this.tryEntries[r];
        if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) {
          var i = o;
          break;
        }
      }
      i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null);
      var a = i ? i.completion : {};
      return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a);
    },
    complete: function (t, e) {
      if ("throw" === t.type) throw t.arg;
      return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y;
    },
    finish: function (t) {
      for (var e = this.tryEntries.length - 1; e >= 0; --e) {
        var r = this.tryEntries[e];
        if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y;
      }
    },
    catch: function (t) {
      for (var e = this.tryEntries.length - 1; e >= 0; --e) {
        var r = this.tryEntries[e];
        if (r.tryLoc === t) {
          var n = r.completion;
          if ("throw" === n.type) {
            var o = n.arg;
            resetTryEntry(r);
          }
          return o;
        }
      }
      throw Error("illegal catch attempt");
    },
    delegateYield: function (e, r, n) {
      return this.delegate = {
        iterator: values(e),
        resultName: r,
        nextLoc: n
      }, "next" === this.method && (this.arg = t), y;
    }
  }, e;
}
function _setPrototypeOf(t, e) {
  return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) {
    return t.__proto__ = e, t;
  }, _setPrototypeOf(t, e);
}
function _slicedToArray(r, e) {
  return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
}
function _superPropBase(t, o) {
  for (; !{}.hasOwnProperty.call(t, o) && null !== (t = _getPrototypeOf(t)););
  return t;
}
function _toArray(r) {
  return _arrayWithHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableRest();
}
function _toConsumableArray(r) {
  return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r );
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (String )(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _typeof(o) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, _typeof(o);
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}
function _wrapAsyncGenerator(e) {
  return function () {
    return new AsyncGenerator(e.apply(this, arguments));
  };
}
function AsyncGenerator(e) {
  var r, t;
  function resume(r, t) {
    try {
      var n = e[r](t),
        o = n.value,
        u = o instanceof _OverloadYield;
      Promise.resolve(u ? o.v : o).then(function (t) {
        if (u) {
          var i = "return" === r ? "return" : "next";
          if (!o.k || t.done) return resume(i, t);
          t = e[i](t).value;
        }
        settle(n.done ? "return" : "normal", t);
      }, function (e) {
        resume("throw", e);
      });
    } catch (e) {
      settle("throw", e);
    }
  }
  function settle(e, n) {
    switch (e) {
      case "return":
        r.resolve({
          value: n,
          done: !0
        });
        break;
      case "throw":
        r.reject(n);
        break;
      default:
        r.resolve({
          value: n,
          done: !1
        });
    }
    (r = r.next) ? resume(r.key, r.arg) : t = null;
  }
  this._invoke = function (e, n) {
    return new Promise(function (o, u) {
      var i = {
        key: e,
        arg: n,
        resolve: o,
        reject: u,
        next: null
      };
      t ? t = t.next = i : (r = t = i, resume(e, n));
    });
  }, "function" != typeof e.return && (this.return = void 0);
}
AsyncGenerator.prototype["function" == typeof Symbol && Symbol.asyncIterator || "@@asyncIterator"] = function () {
  return this;
}, AsyncGenerator.prototype.next = function (e) {
  return this._invoke("next", e);
}, AsyncGenerator.prototype.throw = function (e) {
  return this._invoke("throw", e);
}, AsyncGenerator.prototype.return = function (e) {
  return this._invoke("return", e);
};

var CONNECT_TIMEOUT_TCP = 5000;
var CONNECT_TIMEOUT_UTP = 5000;
var CONNECT_TIMEOUT_WEBRTC = 25000;
var HANDSHAKE_TIMEOUT = 25000;

// Types of peers
var TYPE_TCP_INCOMING = 'tcpIncoming';
var TYPE_TCP_OUTGOING = 'tcpOutgoing';
var TYPE_UTP_INCOMING = 'utpIncoming';
var TYPE_UTP_OUTGOING = 'utpOutgoing';
var TYPE_WEBRTC = 'webrtc';
var TYPE_WEBSEED = 'webSeed';

// Source used to obtain the peer
var SOURCE_MANUAL = 'manual';
var SOURCE_TRACKER = 'tracker';
var SOURCE_DHT = 'dht';
var SOURCE_LSD = 'lsd';
var SOURCE_UT_PEX = 'ut_pex';
var debug$5 = debugFactory('webtorrent:peer');
var secure = false;
var enableSecure = function enableSecure() {
  secure = true;
};

/**
 * Peer. Represents a peer in the torrent swarm.
 *
 * @param {string} id "ip:port" string, peer id (for WebRTC peers), or url (for Web Seeds)
 * @param {string} type the type of the peer
 */
var Peer = /*#__PURE__*/function (_EventEmitter) {
  function Peer(id, type) {
    var _this;
    _classCallCheck(this, Peer);
    _this = _callSuper(this, Peer);
    _this.id = id;
    _this.type = type;
    debug$5('new %s Peer %s', type, id);
    _this.addr = null;
    _this.conn = null;
    _this.swarm = null;
    _this.wire = null;
    _this.source = null;
    _this.connected = false;
    _this.destroyed = false;
    _this.timeout = null; // handshake timeout
    _this.retries = 0; // outgoing TCP connection retry count

    _this.sentPe1 = false;
    _this.sentPe2 = false;
    _this.sentPe3 = false;
    _this.sentPe4 = false;
    _this.sentHandshake = false;
    return _this;
  }

  /**
   * Called once the peer is connected (i.e. fired 'connect' event)
   * @param {Socket} conn
   */
  _inherits(Peer, _EventEmitter);
  return _createClass(Peer, [{
    key: "onConnect",
    value: function onConnect() {
      var _this2 = this;
      if (this.destroyed) return;
      this.connected = true;
      debug$5('Peer %s connected', this.id);
      clearTimeout(this.connectTimeout);
      var conn = this.conn;
      conn.once('end', function () {
        _this2.destroy();
      });
      conn.once('close', function () {
        _this2.destroy();
      });
      conn.once('finish', function () {
        _this2.destroy();
      });
      conn.once('error', function (err) {
        _this2.destroy(err);
      });
      var wire = this.wire = new Wire(this.type, this.retries, secure);
      wire.once('end', function () {
        _this2.destroy();
      });
      wire.once('close', function () {
        _this2.destroy();
      });
      wire.once('finish', function () {
        _this2.destroy();
      });
      wire.once('error', function (err) {
        _this2.destroy(err);
      });
      wire.once('pe1', function () {
        _this2.onPe1();
      });
      wire.once('pe2', function () {
        _this2.onPe2();
      });
      wire.once('pe3', function () {
        _this2.onPe3();
      });
      wire.once('pe4', function () {
        _this2.onPe4();
      });
      wire.once('handshake', function (infoHash, peerId) {
        _this2.onHandshake(infoHash, peerId);
      });
      this.startHandshakeTimeout();
      this.setThrottlePipes();
      if (this.swarm) {
        if (this.type === 'tcpOutgoing') {
          if (secure && this.retries === 0 && !this.sentPe1) this.sendPe1();else if (!this.sentHandshake) this.handshake();
        } else if (this.type !== 'tcpIncoming' && !this.sentHandshake) this.handshake();
      }
    }
  }, {
    key: "sendPe1",
    value: function sendPe1() {
      this.wire.sendPe1();
      this.sentPe1 = true;
    }
  }, {
    key: "onPe1",
    value: function onPe1() {
      this.sendPe2();
    }
  }, {
    key: "sendPe2",
    value: function sendPe2() {
      this.wire.sendPe2();
      this.sentPe2 = true;
    }
  }, {
    key: "onPe2",
    value: function onPe2() {
      this.sendPe3();
    }
  }, {
    key: "sendPe3",
    value: function sendPe3() {
      this.wire.sendPe3(this.swarm.infoHash);
      this.sentPe3 = true;
    }
  }, {
    key: "onPe3",
    value: function onPe3(infoHashHash) {
      if (this.swarm) {
        if (this.swarm.infoHashHash !== infoHashHash) {
          this.destroy(new Error('unexpected crypto handshake info hash for this swarm'));
        }
        this.sendPe4();
      }
    }
  }, {
    key: "sendPe4",
    value: function sendPe4() {
      this.wire.sendPe4(this.swarm.infoHash);
      this.sentPe4 = true;
    }
  }, {
    key: "onPe4",
    value: function onPe4() {
      if (!this.sentHandshake) this.handshake();
    }
  }, {
    key: "clearPipes",
    value: function clearPipes() {
      this.conn.unpipe();
      this.wire.unpipe();
    }
  }, {
    key: "setThrottlePipes",
    value: function setThrottlePipes() {
      var self = this;
      streamx.pipeline(this.conn, this.throttleGroups.down.throttle(), new streamx.Transform({
        transform: function transform(chunk, callback) {
          self.emit('download', chunk.length);
          if (self.destroyed) return;
          callback(null, chunk);
        }
      }), this.wire, this.throttleGroups.up.throttle(), new streamx.Transform({
        transform: function transform(chunk, callback) {
          self.emit('upload', chunk.length);
          if (self.destroyed) return;
          callback(null, chunk);
        }
      }), this.conn);
    }

    /**
     * Called when handshake is received from remote peer.
     * @param {string} infoHash
     * @param {string} peerId
     */
  }, {
    key: "onHandshake",
    value: function onHandshake(infoHash, peerId) {
      if (!this.swarm) return; // `this.swarm` not set yet, so do nothing
      if (this.destroyed) return;
      if (this.swarm.destroyed) {
        return this.destroy(new Error('swarm already destroyed'));
      }
      if (infoHash !== this.swarm.infoHash) {
        return this.destroy(new Error('unexpected handshake info hash for this swarm'));
      }
      if (peerId === this.swarm.peerId) {
        return this.destroy(new Error('refusing to connect to ourselves'));
      }
      debug$5('Peer %s got handshake %s', this.id, infoHash);
      clearTimeout(this.handshakeTimeout);
      this.retries = 0;
      var addr = this.addr;
      if (!addr && this.conn.remoteAddress && this.conn.remotePort) {
        addr = "".concat(this.conn.remoteAddress, ":").concat(this.conn.remotePort);
      }
      this.swarm._onWire(this.wire, addr);

      // swarm could be destroyed in user's 'wire' event handler
      if (!this.swarm || this.swarm.destroyed) return;
      if (!this.sentHandshake) this.handshake();
    }
  }, {
    key: "handshake",
    value: function handshake() {
      var opts = {
        dht: this.swarm["private"] ? false : !!this.swarm.client.dht,
        fast: true
      };
      this.wire.handshake(this.swarm.infoHash, this.swarm.client.peerId, opts);
      this.sentHandshake = true;
    }
  }, {
    key: "startConnectTimeout",
    value: function startConnectTimeout() {
      var _this3 = this;
      clearTimeout(this.connectTimeout);
      var connectTimeoutValues = {
        webrtc: CONNECT_TIMEOUT_WEBRTC,
        tcpOutgoing: CONNECT_TIMEOUT_TCP,
        utpOutgoing: CONNECT_TIMEOUT_UTP
      };
      this.connectTimeout = setTimeout(function () {
        _this3.destroy(new Error('connect timeout'));
      }, connectTimeoutValues[this.type]);
      if (this.connectTimeout.unref) this.connectTimeout.unref();
    }
  }, {
    key: "startHandshakeTimeout",
    value: function startHandshakeTimeout() {
      var _this4 = this;
      clearTimeout(this.handshakeTimeout);
      this.handshakeTimeout = setTimeout(function () {
        _this4.destroy(new Error('handshake timeout'));
      }, HANDSHAKE_TIMEOUT);
      if (this.handshakeTimeout.unref) this.handshakeTimeout.unref();
    }
  }, {
    key: "destroy",
    value: function destroy(err) {
      if (this.destroyed) return;
      this.destroyed = true;
      this.connected = false;
      debug$5('destroy %s %s (error: %s)', this.type, this.id, err && (err.message || err));
      clearTimeout(this.connectTimeout);
      clearTimeout(this.handshakeTimeout);
      var swarm = this.swarm;
      var conn = this.conn;
      var wire = this.wire;
      this.swarm = null;
      this.conn = null;
      this.wire = null;
      if (swarm && wire) {
        arrayRemove(swarm.wires, swarm.wires.indexOf(wire));
      }
      if (conn) {
        conn.on('error', function () {});
        conn.destroy();
      }
      if (wire) wire.destroy();
      if (swarm) swarm.removePeer(this.id);
    }
  }]);
}(EventEmitter);
Peer.TYPE_TCP_INCOMING = TYPE_TCP_INCOMING;
Peer.TYPE_TCP_OUTGOING = TYPE_TCP_OUTGOING;
Peer.TYPE_UTP_INCOMING = TYPE_UTP_INCOMING;
Peer.TYPE_UTP_OUTGOING = TYPE_UTP_OUTGOING;
Peer.TYPE_WEBRTC = TYPE_WEBRTC;
Peer.TYPE_WEBSEED = TYPE_WEBSEED;
Peer.SOURCE_MANUAL = SOURCE_MANUAL;
Peer.SOURCE_TRACKER = SOURCE_TRACKER;
Peer.SOURCE_DHT = SOURCE_DHT;
Peer.SOURCE_LSD = SOURCE_LSD;
Peer.SOURCE_UT_PEX = SOURCE_UT_PEX;

/**
 * WebRTC peer connections start out connected, because WebRTC peers require an
 * "introduction" (i.e. WebRTC signaling), and there's no equivalent to an IP address
 * that lets you refer to a WebRTC endpoint.
 */
Peer.createWebRTCPeer = function (conn, swarm, throttleGroups) {
  var peer = new Peer(conn.id, 'webrtc');
  peer.conn = conn;
  peer.swarm = swarm;
  peer.throttleGroups = throttleGroups;
  if (peer.conn.connected) {
    peer.onConnect();
  } else {
    var cleanup = function cleanup() {
      peer.conn.removeListener('connect', onConnect);
      peer.conn.removeListener('error', onError);
    };
    var onConnect = function onConnect() {
      cleanup();
      peer.onConnect();
    };
    var onError = function onError(err) {
      cleanup();
      peer.destroy(err);
    };
    peer.conn.once('connect', onConnect);
    peer.conn.once('error', onError);
    peer.startConnectTimeout();
  }
  return peer;
};

/**
 * Incoming TCP peers start out connected, because the remote peer connected to the
 * listening port of the TCP server. Until the remote peer sends a handshake, we don't
 * know what swarm the connection is intended for.
 */
Peer.createTCPIncomingPeer = function (conn, throttleGroups) {
  return Peer._createIncomingPeer(conn, TYPE_TCP_INCOMING, throttleGroups);
};

/**
 * Incoming uTP peers start out connected, because the remote peer connected to the
 * listening port of the uTP server. Until the remote peer sends a handshake, we don't
 * know what swarm the connection is intended for.
 */
Peer.createUTPIncomingPeer = function (conn, throttleGroups) {
  return Peer._createIncomingPeer(conn, TYPE_UTP_INCOMING, throttleGroups);
};

/**
 * Outgoing TCP peers start out with just an IP address. At some point (when there is an
 * available connection), the client can attempt to connect to the address.
 */
Peer.createTCPOutgoingPeer = function (addr, swarm, throttleGroups) {
  return Peer._createOutgoingPeer(addr, swarm, TYPE_TCP_OUTGOING, throttleGroups);
};

/**
 * Outgoing uTP peers start out with just an IP address. At some point (when there is an
 * available connection), the client can attempt to connect to the address.
 */
Peer.createUTPOutgoingPeer = function (addr, swarm, throttleGroups) {
  return Peer._createOutgoingPeer(addr, swarm, TYPE_UTP_OUTGOING, throttleGroups);
};
Peer._createIncomingPeer = function (conn, type, throttleGroups) {
  var addr = "".concat(conn.remoteAddress, ":").concat(conn.remotePort);
  var peer = new Peer(addr, type);
  peer.conn = conn;
  peer.addr = addr;
  peer.throttleGroups = throttleGroups;
  peer.onConnect();
  return peer;
};
Peer._createOutgoingPeer = function (addr, swarm, type, throttleGroups) {
  var peer = new Peer(addr, type);
  peer.addr = addr;
  peer.swarm = swarm;
  peer.throttleGroups = throttleGroups;
  return peer;
};

/**
 * Peer that represents a Web Seed (BEP17 / BEP19).
 */

Peer.createWebSeedPeer = function (conn, id, swarm, throttleGroups) {
  var peer = new Peer(id, TYPE_WEBSEED);
  peer.swarm = swarm;
  peer.conn = conn;
  peer.throttleGroups = throttleGroups;
  peer.onConnect();
  return peer;
};

var peer = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: Peer,
  enableSecure: enableSecure
});

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

// this file needs to conditionally import a module, ESM doesn't support this synchronously
// we could avoid .cjs by using node:module but that doesn't sit well with preprocessors like typescript
// and bundlers which can bundle for node like webpack

var utp = function () {
  try {
    return require('utp-native');
  } catch (err) {
    console.warn('WebTorrent: uTP not supported', err);
    return {};
  }
}();
var utp$1 = /*@__PURE__*/getDefaultExportFromCjs(utp);

var debug$4 = debugFactory('webtorrent:conn-pool');

/**
 * Connection Pool
 *
 * A connection pool allows multiple swarms to listen on the same TCP/UDP port and determines
 * which swarm incoming connections are intended for by inspecting the bittorrent
 * handshake that the remote peer sends.
 *
 * @param {number} port
 */
var ConnPool = /*#__PURE__*/function () {
  function ConnPool(client) {
    var _this = this;
    _classCallCheck(this, ConnPool);
    debug$4('create pool (port %s)', client.torrentPort);
    this._client = client;

    // Temporarily store incoming connections so they can be destroyed if the server is
    // closed before the connection is passed off to a Torrent.
    this._pendingConns = new Set();
    this._onTCPConnectionBound = function (conn) {
      _this._onConnection(conn, 'tcp');
    };
    this._onUTPConnectionBound = function (conn) {
      _this._onConnection(conn, 'utp');
    };
    this._onListening = function () {
      _this._client._onListening();
    };
    this._onTCPError = function (err) {
      _this._client._destroy(err);
    };
    this._onUTPError = function () {
      _this._client.utp = false;
    };

    // Setup TCP
    this.tcpServer = net.createServer();
    this.tcpServer.on('connection', this._onTCPConnectionBound);
    this.tcpServer.on('error', this._onTCPError);

    // Start TCP
    this.tcpServer.listen(client.torrentPort, function () {
      debug$4('creating tcpServer in port %s', _this.tcpServer.address().port);
      if (_this._client.utp) {
        // Setup uTP
        _this.utpServer = utp$1.createServer();
        _this.utpServer.on('connection', _this._onUTPConnectionBound);
        _this.utpServer.on('listening', _this._onListening);
        _this.utpServer.on('error', _this._onUTPError);

        // Start uTP
        debug$4('creating utpServer in port %s', _this.tcpServer.address().port);
        _this.utpServer.listen(_this.tcpServer.address().port);
      } else {
        _this._onListening();
      }
    });
  }

  /**
   * Destroy this Conn pool.
   * @param  {function} cb
   */
  return _createClass(ConnPool, [{
    key: "destroy",
    value: function destroy(cb) {
      debug$4('destroy conn pool');
      if (this.utpServer) {
        this.utpServer.removeListener('connection', this._onUTPConnectionBound);
        this.utpServer.removeListener('listening', this._onListening);
        this.utpServer.removeListener('error', this._onUTPError);
      }
      this.tcpServer.removeListener('connection', this._onTCPConnectionBound);
      this.tcpServer.removeListener('error', this._onTCPError);

      // Destroy all open connection objects so server can close gracefully without waiting
      // for connection timeout or remote peer to disconnect.
      this._pendingConns.forEach(function (conn) {
        conn.on('error', noop$1);
        conn.destroy();
      });
      if (this.utpServer) {
        try {
          this.utpServer.close(cb);
        } catch (err) {
          if (cb) queueMicrotask(cb);
        }
      }
      try {
        this.tcpServer.close(cb);
      } catch (err) {
        if (cb) queueMicrotask(cb);
      }
      this.tcpServer = null;
      this.utpServer = null;
      this._client = null;
      this._pendingConns = null;
    }

    /**
     * On incoming connections, we expect the remote peer to send a handshake first. Based
     * on the infoHash in that handshake, route the peer to the right swarm.
     */
  }, {
    key: "_onConnection",
    value: function _onConnection(conn, type) {
      var self = this;

      // If the connection has already been closed before the `connect` event is fired,
      // then `remoteAddress` will not be available, and we can't use this connection.
      // - Node.js issue: https://github.com/nodejs/node-v0.x-archive/issues/7566
      // - WebTorrent issue: https://github.com/webtorrent/webtorrent/issues/398
      if (!conn.remoteAddress) {
        conn.on('error', noop$1);
        conn.destroy();
        return;
      }
      self._pendingConns.add(conn);
      conn.once('close', cleanupPending);
      var peer = type === 'utp' ? Peer.createUTPIncomingPeer(conn, this._client.throttleGroups) : Peer.createTCPIncomingPeer(conn, this._client.throttleGroups);
      var wire = peer.wire;
      wire.once('pe3', onPe3);
      wire.once('handshake', onHandshake);
      function onPe3(_x) {
        return _onPe.apply(this, arguments);
      }
      function _onPe() {
        _onPe = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(infoHashHash) {
          var torrent;
          return _regeneratorRuntime().wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return self._client._getByHash(infoHashHash);
              case 2:
                torrent = _context.sent;
                if (torrent) {
                  peer.swarm = torrent;
                  torrent._addIncomingPeer(peer);
                  peer.onPe3(infoHashHash);
                } else {
                  peer.destroy(new Error("Unexpected info hash hash ".concat(infoHashHash, " from incoming peer ").concat(peer.id)));
                }
              case 4:
              case "end":
                return _context.stop();
            }
          }, _callee);
        }));
        return _onPe.apply(this, arguments);
      }
      function onHandshake(_x2, _x3) {
        return _onHandshake.apply(this, arguments);
      }
      function _onHandshake() {
        _onHandshake = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(infoHash, peerId) {
          var torrent, err;
          return _regeneratorRuntime().wrap(function _callee2$(_context2) {
            while (1) switch (_context2.prev = _context2.next) {
              case 0:
                cleanupPending();
                _context2.next = 3;
                return self._client.get(infoHash);
              case 3:
                torrent = _context2.sent;
                // only add incoming peer if didn't already do so in protocol encryption handshake
                if (torrent) {
                  if (!peer.swarm) {
                    peer.swarm = torrent;
                    torrent._addIncomingPeer(peer);
                  }
                  peer.onHandshake(infoHash, peerId);
                } else {
                  err = new Error("Unexpected info hash ".concat(infoHash, " from incoming peer ").concat(peer.id));
                  peer.destroy(err);
                }
              case 5:
              case "end":
                return _context2.stop();
            }
          }, _callee2);
        }));
        return _onHandshake.apply(this, arguments);
      }
      function cleanupPending() {
        conn.removeListener('close', cleanupPending);
        wire.removeListener('handshake', onHandshake);
        if (self._pendingConns) {
          self._pendingConns["delete"](conn);
        }
      }
    }
  }]);
}();
ConnPool.UTP_SUPPORT = Object.keys(utp$1).length > 0;
function noop$1() {}

var debug$3 = debugFactory('webtorrent:file-iterator');

/**
 * Async iterator of a torrent file
 *
 * @param {File} file
 * @param {Object} opts
 * @param {number} opts.start iterator slice of file, starting from this byte (inclusive)
 * @param {number} opts.end iterator slice of file, ending with this byte (inclusive)
 */
var FileIterator = /*#__PURE__*/function (_EventEmitter) {
  function FileIterator(file, _ref) {
    var _this;
    var start = _ref.start,
      end = _ref.end;
    _classCallCheck(this, FileIterator);
    _this = _callSuper(this, FileIterator);
    _this._torrent = file._torrent;
    _this._pieceLength = file._torrent.pieceLength;
    _this._startPiece = (start + file.offset) / _this._pieceLength | 0;
    _this._endPiece = (end + file.offset) / _this._pieceLength | 0;
    _this._piece = _this._startPiece;
    _this._offset = start + file.offset - _this._startPiece * _this._pieceLength;
    _this._missing = end - start + 1;
    _this._criticalLength = Math.min(1024 * 1024 / _this._pieceLength | 0, 2);
    _this._torrent._select(_this._startPiece, _this._endPiece, 1, null, true);
    _this.destroyed = false;
    return _this;
  }
  _inherits(FileIterator, _EventEmitter);
  return _createClass(FileIterator, [{
    key: Symbol.asyncIterator,
    value: function value() {
      return this;
    }
  }, {
    key: "next",
    value: function next() {
      var _this2 = this;
      return new Promise(function (resolve, reject) {
        if (_this2._missing === 0 || _this2.destroyed) {
          resolve({
            done: true
          });
          return _this2.destroy();
        }
        var pump = function pump(index, opts) {
          if (!_this2._torrent.bitfield.get(index)) {
            var listener = function listener(i) {
              if (i === index || _this2.destroyed) {
                _this2._torrent.removeListener('verified', listener);
                pump(index, opts);
              }
            };
            _this2._torrent.on('verified', listener);
            return _this2._torrent.critical(index, index + _this2._criticalLength);
          }
          if (_this2._torrent.destroyed) return reject(new Error('Torrent removed'));
          _this2._torrent.store.get(index, opts, function (err, buffer) {
            if (_this2.destroyed) return resolve({
              done: true
            }); // prevent hanging
            debug$3('read %s and yielding (length %s) (err %s)', index, buffer === null || buffer === void 0 ? void 0 : buffer.length, err === null || err === void 0 ? void 0 : err.message);
            if (err) return reject(err);

            // prevent re-wrapping outside of promise
            resolve({
              value: buffer,
              done: false
            });
          });
        };
        var length = Math.min(_this2._missing, _this2._pieceLength - _this2._offset);
        pump(_this2._piece++, {
          length: length,
          offset: _this2._offset
        });
        _this2._missing -= length;
        _this2._offset = 0;
      });
    }
  }, {
    key: "return",
    value: function () {
      var _return2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              this.destroy();
              return _context.abrupt("return", {
                done: true
              });
            case 2:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function _return() {
        return _return2.apply(this, arguments);
      }
      return _return;
    }()
  }, {
    key: "throw",
    value: function () {
      var _throw2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(err) {
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              throw err;
            case 1:
            case "end":
              return _context2.stop();
          }
        }, _callee2);
      }));
      function _throw(_x) {
        return _throw2.apply(this, arguments);
      }
      return _throw;
    }()
  }, {
    key: "destroy",
    value: function destroy() {
      var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
      var err = arguments.length > 1 ? arguments[1] : undefined;
      if (this.destroyed) return;
      this.destroyed = true;
      if (!this._torrent.destroyed) {
        this._torrent._deselect(this._startPiece, this._endPiece, true);
      }
      this.emit('return');
      cb(err);
    }
  }]);
}(EventEmitter);

var File = /*#__PURE__*/function (_EventEmitter) {
  function File(torrent, file) {
    var _this;
    _classCallCheck(this, File);
    _this = _callSuper(this, File);
    _this._torrent = torrent;
    _this._destroyed = false;
    _this._fileStreams = new Set();
    _this._iterators = new Set();
    _this.name = file.name;
    _this.path = file.path;
    _this.length = file.length;
    _this.size = file.length;
    _this.type = mime.getType(_this.name) || 'application/octet-stream';
    _this.offset = file.offset;
    _this.done = false;
    var start = file.offset;
    var end = start + file.length - 1;
    _this._startPiece = start / _this._torrent.pieceLength | 0;
    _this._endPiece = end / _this._torrent.pieceLength | 0;
    if (_this.length === 0) {
      _this.done = true;
      _this.emit('done');
    }
    _this._client = torrent.client;
    return _this;
  }
  _inherits(File, _EventEmitter);
  return _createClass(File, [{
    key: "downloaded",
    get: function get() {
      if (this._destroyed || !this._torrent.bitfield) return 0;
      var _this$_torrent = this._torrent,
        pieces = _this$_torrent.pieces,
        bitfield = _this$_torrent.bitfield,
        pieceLength = _this$_torrent.pieceLength,
        lastPieceLength = _this$_torrent.lastPieceLength;
      var start = this._startPiece,
        end = this._endPiece;
      var getPieceLength = function getPieceLength(pieceIndex) {
        return pieceIndex === pieces.length - 1 ? lastPieceLength : pieceLength;
      };
      var getPieceDownloaded = function getPieceDownloaded(pieceIndex) {
        var len = pieceIndex === pieces.length - 1 ? lastPieceLength : pieceLength;
        if (bitfield.get(pieceIndex)) {
          // verified data
          return len;
        } else {
          // "in progress" data
          return len - pieces[pieceIndex].missing;
        }
      };
      var downloaded = 0;
      for (var index = start; index <= end; index += 1) {
        var pieceDownloaded = getPieceDownloaded(index);
        downloaded += pieceDownloaded;
        if (index === start) {
          // First piece may have an offset, e.g. irrelevant bytes from the end of
          // the previous file
          var irrelevantFirstPieceBytes = this.offset % pieceLength;
          downloaded -= Math.min(irrelevantFirstPieceBytes, pieceDownloaded);
        }
        if (index === end) {
          // Last piece may have an offset, e.g. irrelevant bytes from the start
          // of the next file
          var irrelevantLastPieceBytes = getPieceLength(end) - (this.offset + this.length) % pieceLength;
          downloaded -= Math.min(irrelevantLastPieceBytes, pieceDownloaded);
        }
      }
      return downloaded;
    }
  }, {
    key: "progress",
    get: function get() {
      return this.length ? this.downloaded / this.length : 0;
    }
  }, {
    key: "select",
    value: function select(priority) {
      if (this.length === 0) return;
      this._torrent.select(this._startPiece, this._endPiece, priority);
    }
  }, {
    key: "deselect",
    value: function deselect() {
      if (this.length === 0) return;
      this._torrent.deselect(this._startPiece, this._endPiece);
    }
  }, {
    key: Symbol.asyncIterator,
    value: function value() {
      var _this2 = this;
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      if (this.length === 0) return function () {
        var _empty = _wrapAsyncGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
          return _regeneratorRuntime().wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
              case 0:
              case "end":
                return _context.stop();
            }
          }, _callee);
        }));
        function empty() {
          return _empty.apply(this, arguments);
        }
        return empty;
      }()();
      var _ref = opts !== null && opts !== void 0 ? opts : {},
        _ref$start = _ref.start,
        start = _ref$start === void 0 ? 0 : _ref$start;
      var end = opts !== null && opts !== void 0 && opts.end && opts.end < this.length ? opts.end : this.length - 1;
      if (this.done) {
        return chunkStoreIterator.chunkStoreRead(this._torrent.store, {
          offset: start + this.offset,
          length: end - start + 1
        });
      }
      var iterator = new FileIterator(this, {
        start: start,
        end: end
      });
      this._iterators.add(iterator);
      iterator.once('return', function () {
        _this2._iterators["delete"](iterator);
      });
      return iterator;
    }
  }, {
    key: "createReadStream",
    value: function createReadStream(opts) {
      var _this3 = this;
      var iterator = this[Symbol.asyncIterator](opts);
      var fileStream = streamx.Readable.from(iterator);
      this._fileStreams.add(fileStream);
      fileStream.once('close', function () {
        _this3._fileStreams["delete"](fileStream);
      });
      return fileStream;
    }
  }, {
    key: "arrayBuffer",
    value: function () {
      var _arrayBuffer = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(opts) {
        var data, offset, _iteratorAbruptCompletion, _didIteratorError, _iteratorError, _iterator, _step, chunk;
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              data = new Uint8Array(this.length);
              offset = 0;
              _iteratorAbruptCompletion = false;
              _didIteratorError = false;
              _context2.prev = 4;
              _iterator = _asyncIterator(this[Symbol.asyncIterator](opts));
            case 6:
              _context2.next = 8;
              return _iterator.next();
            case 8:
              if (!(_iteratorAbruptCompletion = !(_step = _context2.sent).done)) {
                _context2.next = 15;
                break;
              }
              chunk = _step.value;
              data.set(chunk, offset);
              offset += chunk.length;
            case 12:
              _iteratorAbruptCompletion = false;
              _context2.next = 6;
              break;
            case 15:
              _context2.next = 21;
              break;
            case 17:
              _context2.prev = 17;
              _context2.t0 = _context2["catch"](4);
              _didIteratorError = true;
              _iteratorError = _context2.t0;
            case 21:
              _context2.prev = 21;
              _context2.prev = 22;
              if (!(_iteratorAbruptCompletion && _iterator["return"] != null)) {
                _context2.next = 26;
                break;
              }
              _context2.next = 26;
              return _iterator["return"]();
            case 26:
              _context2.prev = 26;
              if (!_didIteratorError) {
                _context2.next = 29;
                break;
              }
              throw _iteratorError;
            case 29:
              return _context2.finish(26);
            case 30:
              return _context2.finish(21);
            case 31:
              return _context2.abrupt("return", data.buffer);
            case 32:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this, [[4, 17, 21, 31], [22,, 26, 30]]);
      }));
      function arrayBuffer(_x) {
        return _arrayBuffer.apply(this, arguments);
      }
      return arrayBuffer;
    }()
  }, {
    key: "blob",
    value: function () {
      var _blob = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(opts) {
        return _regeneratorRuntime().wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              _context3.t0 = Blob;
              _context3.next = 3;
              return this.arrayBuffer(opts);
            case 3:
              _context3.t1 = _context3.sent;
              _context3.t2 = [_context3.t1];
              _context3.t3 = {
                type: this.type
              };
              return _context3.abrupt("return", new _context3.t0(_context3.t2, _context3.t3));
            case 7:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this);
      }));
      function blob(_x2) {
        return _blob.apply(this, arguments);
      }
      return blob;
    }()
  }, {
    key: "stream",
    value: function stream(opts) {
      var _this4 = this;
      var iterator;
      return new ReadableStream({
        start: function start() {
          iterator = _this4[Symbol.asyncIterator](opts);
        },
        pull: function pull(controller) {
          return _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4() {
            var _yield$iterator$next, value, done;
            return _regeneratorRuntime().wrap(function _callee4$(_context4) {
              while (1) switch (_context4.prev = _context4.next) {
                case 0:
                  _context4.next = 2;
                  return iterator.next();
                case 2:
                  _yield$iterator$next = _context4.sent;
                  value = _yield$iterator$next.value;
                  done = _yield$iterator$next.done;
                  if (done) {
                    controller.close();
                  } else {
                    controller.enqueue(value);
                  }
                case 6:
                case "end":
                  return _context4.stop();
              }
            }, _callee4);
          }))();
        },
        cancel: function cancel() {
          iterator["return"]();
        }
      });
    }
  }, {
    key: "streamURL",
    get: function get() {
      if (!this._client._server) throw new Error('No server created');
      return "".concat(this._client._server.pathname, "/").concat(this._torrent.infoHash, "/").concat(this.path);
    }
  }, {
    key: "streamTo",
    value: function streamTo(elem) {
      elem.src = this.streamURL;
      return elem;
    }
  }, {
    key: "includes",
    value: function includes(piece) {
      return this._startPiece <= piece && this._endPiece >= piece;
    }
  }, {
    key: "_destroy",
    value: function _destroy() {
      this._destroyed = true;
      this._torrent = null;
      var _iterator2 = _createForOfIteratorHelper(this._fileStreams),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var fileStream = _step2.value;
          fileStream.destroy();
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      this._fileStreams.clear();
      var _iterator3 = _createForOfIteratorHelper(this._iterators),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var iterator = _step3.value;
          iterator.destroy();
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      this._iterators.clear();
    }
  }]);
}(EventEmitter);

/**
 * Mapping of torrent pieces to their respective availability in the torrent swarm. Used
 * by the torrent manager for implementing the rarest piece first selection strategy.
 */
var RarityMap = /*#__PURE__*/function () {
  function RarityMap(torrent) {
    var _this = this;
    _classCallCheck(this, RarityMap);
    this._torrent = torrent;
    this._numPieces = torrent.pieces.length;
    this._pieces = new Array(this._numPieces);
    this._onWire = function (wire) {
      _this.recalculate();
      _this._initWire(wire);
    };
    this._onWireHave = function (index) {
      _this._pieces[index] += 1;
    };
    this._onWireBitfield = function () {
      _this.recalculate();
    };
    this._torrent.wires.forEach(function (wire) {
      _this._initWire(wire);
    });
    this._torrent.on('wire', this._onWire);
    this.recalculate();
  }

  /**
   * Get the index of the rarest piece. Optionally, pass a filter function to exclude
   * certain pieces (for instance, those that we already have).
   *
   * @param {function} pieceFilterFunc
   * @return {number} index of rarest piece, or -1
   */
  return _createClass(RarityMap, [{
    key: "getRarestPiece",
    value: function getRarestPiece(pieceFilterFunc) {
      var candidates = [];
      var min = Infinity;
      for (var i = 0; i < this._numPieces; ++i) {
        if (pieceFilterFunc && !pieceFilterFunc(i)) continue;
        var availability = this._pieces[i];
        if (availability === min) {
          candidates.push(i);
        } else if (availability < min) {
          candidates = [i];
          min = availability;
        }
      }
      if (candidates.length) {
        // if there are multiple pieces with the same availability, choose one randomly
        return candidates[Math.random() * candidates.length | 0];
      } else {
        return -1;
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var _this2 = this;
      this._torrent.removeListener('wire', this._onWire);
      this._torrent.wires.forEach(function (wire) {
        _this2._cleanupWireEvents(wire);
      });
      this._torrent = null;
      this._pieces = null;
      this._onWire = null;
      this._onWireHave = null;
      this._onWireBitfield = null;
    }
  }, {
    key: "_initWire",
    value: function _initWire(wire) {
      var _this3 = this;
      wire._onClose = function () {
        _this3._cleanupWireEvents(wire);
        for (var i = 0; i < _this3._numPieces; ++i) {
          _this3._pieces[i] -= wire.peerPieces.get(i);
        }
      };
      wire.on('have', this._onWireHave);
      wire.on('bitfield', this._onWireBitfield);
      wire.once('close', wire._onClose);
    }

    /**
     * Recalculates piece availability across all peers in the torrent.
     */
  }, {
    key: "recalculate",
    value: function recalculate() {
      this._pieces.fill(0);
      var _iterator = _createForOfIteratorHelper(this._torrent.wires),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var wire = _step.value;
          for (var i = 0; i < this._numPieces; ++i) {
            this._pieces[i] += wire.peerPieces.get(i);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }, {
    key: "_cleanupWireEvents",
    value: function _cleanupWireEvents(wire) {
      wire.removeListener('have', this._onWireHave);
      wire.removeListener('bitfield', this._onWireBitfield);
      if (wire._onClose) wire.removeListener('close', wire._onClose);
      wire._onClose = null;
    }
  }]);
}();

var name = "@gmanole01/webtorrent";
var description = "Streaming torrent client";
var version$1 = "2.4.11";
var author = {
	name: "WebTorrent LLC",
	email: "feross@webtorrent.io",
	url: "https://webtorrent.io"
};
var type = "module";
var dependencies = {
	"@silentbot1/nat-api": "^0.4.7",
	"@thaunknown/simple-peer": "^10.0.9",
	"@types/bittorrent-protocol": "*",
	"@types/node": "*",
	"@types/parse-torrent": "*",
	"@types/simple-peer": "*",
	"@webtorrent/http-node": "^1.3.0",
	"addr-to-ip-port": "^2.0.0",
	bitfield: "^4.2.0",
	"bittorrent-dht": "^11.0.6",
	"bittorrent-protocol": "^4.1.13",
	"cache-chunk-store": "^3.2.2",
	"chunk-store-iterator": "^1.0.3",
	cpus: "^1.0.3",
	"create-torrent": "^6.0.17",
	"cross-fetch-ponyfill": "^1.0.3",
	debug: "^4.3.5",
	"escape-html": "^1.0.3",
	"fs-chunk-store": "^4.1.0",
	"fsa-chunk-store": "^1.1.5",
	"immediate-chunk-store": "^2.2.0",
	"join-async-iterator": "^1.1.1",
	"load-ip-set": "^3.0.1",
	lt_donthave: "^2.0.1",
	"memory-chunk-store": "^1.3.5",
	mime: "^3.0.0",
	once: "^1.4.0",
	"parse-torrent": "^11.0.17",
	pump: "^3.0.0",
	"queue-microtask": "^1.2.3",
	"random-iterate": "^1.0.1",
	"range-parser": "^1.2.1",
	"run-parallel": "^1.2.0",
	"run-parallel-limit": "^1.1.0",
	"speed-limiter": "^1.0.2",
	streamx: "2.17.0",
	throughput: "^1.0.1",
	"torrent-discovery": "^11.0.6",
	"torrent-piece": "^3.0.0",
	"uint8-util": "^2.2.5",
	"unordered-array-remove": "^1.0.2",
	ut_metadata: "^4.0.3",
	ut_pex: "^4.0.4"
};
var devDependencies = {
	"@babel/core": "^7.24.7",
	"@babel/eslint-parser": "^7.24.7",
	"@babel/plugin-syntax-import-assertions": "7.24.7",
	"@babel/preset-env": "^7.24.7",
	"@rollup/plugin-babel": "^6.0.4",
	"@rollup/plugin-commonjs": "^26.0.1",
	"@rollup/plugin-json": "^6.1.0",
	"@rollup/plugin-terser": "^0.4.4",
	"@webtorrent/semantic-release-config": "1.0.10",
	airtap: "4.0.4",
	"airtap-manual": "1.0.0",
	"airtap-sauce": "1.1.2",
	"airtap-system": "^0.1.0",
	babelify: "10.0.0",
	"bittorrent-tracker": "11.1.0",
	buffer: "^6.0.3",
	"chrome-net": "^3.3.4",
	"crypto-browserify": "^3.12.0",
	disc: "1.3.3",
	eslint: "^8.57.0",
	"eslint-config-standard": "^17.1.0",
	"eslint-plugin-import": "^2.29.1",
	"eslint-plugin-n": "^16.6.2",
	"eslint-plugin-promise": "^6.2.0",
	finalhandler: "1.2.0",
	"native-file-system-adapter": "^3.0.1",
	"network-address": "1.1.2",
	pako: "^2.1.0",
	"path-esm": "^1.0.0",
	querystring: "^0.2.1",
	rollup: "^4.18.0",
	"run-series": "1.1.9",
	"semantic-release": "22.0.12",
	"serve-static": "1.15.0",
	"stream-browserify": "^3.0.0",
	"tap-parser": "^16.0.1",
	"tap-spec": "^5.0.0",
	tape: "^5.8.1",
	"terser-webpack-plugin": "^5.3.10",
	"timers-browserify": "^2.0.12",
	webpack: "^5.92.1",
	"webpack-cli": "^5.1.4",
	"webtorrent-fixtures": "1.7.5"
};
var optionalDependencies = {
	"utp-native": "^2.5.3"
};
var engines = {
	node: ">=16"
};
var homepage = "https://webtorrent.io";
var keywords = [
	"bittorrent",
	"bittorrent client",
	"download",
	"mad science",
	"p2p",
	"peer-to-peer",
	"peers",
	"streaming",
	"swarm",
	"torrent",
	"web torrent",
	"webrtc",
	"webrtc data",
	"webtorrent"
];
var license = "MIT";
var main = "./output/index.js";
var types = "./index.d.ts";
var repository = {
	type: "git",
	url: "git://github.com/gmanole01/webtorrent.git"
};
var scripts = {
	build: "rollup --config",
	prepublishOnly: "npm run build",
	preversion: "npm run build"
};
var renovate = {
	"extends": [
		"github>webtorrent/renovate-config"
	],
	rangeStrategy: "bump"
};
var release = {
	"extends": "@webtorrent/semantic-release-config"
};
var require$$0 = {
	name: name,
	description: description,
	version: version$1,
	author: author,
	type: type,
	dependencies: dependencies,
	devDependencies: devDependencies,
	optionalDependencies: optionalDependencies,
	engines: engines,
	homepage: homepage,
	keywords: keywords,
	license: license,
	main: main,
	types: types,
	repository: repository,
	scripts: scripts,
	renovate: renovate,
	release: release
};

// Exports package.json to work around "with" and "assert" for backwards compatability.
var version = require$$0.version;
var VERSION = /*@__PURE__*/getDefaultExportFromCjs(version);

var debug$2 = debugFactory('webtorrent:webconn');
var SOCKET_TIMEOUT = 60000;
var RETRY_DELAY = 10000;

/**
 * Converts requests for torrent blocks into http range requests.
 * @param {string} url web seed url
 * @param {Object} torrent
 */
var WebConn = /*#__PURE__*/function (_Wire) {
  function WebConn(url, torrent) {
    var _this;
    _classCallCheck(this, WebConn);
    _this = _callSuper(this, WebConn);
    _this.url = url;
    _this.connId = url; // Unique id to deduplicate web seeds
    _this._torrent = torrent;
    _this._init(url);
    return _this;
  }
  _inherits(WebConn, _Wire);
  return _createClass(WebConn, [{
    key: "_init",
    value: function _init(url) {
      var _this2 = this;
      this.setKeepAlive(true);
      this.use(ltDontHave());
      this.once('handshake', /*#__PURE__*/function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(infoHash, peerId) {
          var hex, numPieces, bitfield, i;
          return _regeneratorRuntime().wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return uint8Util.hash(url, 'hex');
              case 2:
                hex = _context.sent;
                if (!_this2.destroyed) {
                  _context.next = 5;
                  break;
                }
                return _context.abrupt("return");
              case 5:
                _this2.handshake(infoHash, hex);
                numPieces = _this2._torrent.pieces.length;
                bitfield = new BitField(numPieces);
                for (i = 0; i <= numPieces; i++) {
                  bitfield.set(i, true);
                }
                _this2.bitfield(bitfield);
              case 10:
              case "end":
                return _context.stop();
            }
          }, _callee);
        }));
        return function (_x, _x2) {
          return _ref.apply(this, arguments);
        };
      }());
      this.once('interested', function () {
        debug$2('interested');
        _this2.unchoke();
      });
      this.on('uninterested', function () {
        debug$2('uninterested');
      });
      this.on('choke', function () {
        debug$2('choke');
      });
      this.on('unchoke', function () {
        debug$2('unchoke');
      });
      this.on('bitfield', function () {
        debug$2('bitfield');
      });
      this.lt_donthave.on('donthave', function () {
        debug$2('donthave');
      });
      this.on('request', function (pieceIndex, offset, length, callback) {
        debug$2('request pieceIndex=%d offset=%d length=%d', pieceIndex, offset, length);
        _this2.httpRequest(pieceIndex, offset, length, function (err, data) {
          if (err) {
            // Cancel all in progress requests for this piece
            _this2.lt_donthave.donthave(pieceIndex);

            // Wait a little while before saying the webseed has the failed piece again
            var retryTimeout = setTimeout(function () {
              if (_this2.destroyed) return;
              _this2.have(pieceIndex);
            }, RETRY_DELAY);
            if (retryTimeout.unref) retryTimeout.unref();
          }
          callback(err, data);
        });
      });
    }
  }, {
    key: "httpRequest",
    value: function () {
      var _httpRequest = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(pieceIndex, offset, length, cb) {
        var _this3 = this;
        var pieceOffset, rangeStart, rangeEnd, files, requests, requestedFiles, chunks;
        return _regeneratorRuntime().wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              cb = once(cb);
              pieceOffset = pieceIndex * this._torrent.pieceLength;
              rangeStart = pieceOffset + offset;
              /* offset within whole torrent */
              rangeEnd = rangeStart + length - 1; // Web seed URL format:
              // For single-file torrents, make HTTP range requests directly to the web seed URL
              // For multi-file torrents, add the torrent folder and file name to the URL
              files = this._torrent.files;
              if (!(files.length <= 1)) {
                _context3.next = 9;
                break;
              }
              requests = [{
                url: this.url,
                start: rangeStart,
                end: rangeEnd
              }];
              _context3.next = 13;
              break;
            case 9:
              requestedFiles = files.filter(function (file) {
                return file.offset <= rangeEnd && file.offset + file.length > rangeStart;
              });
              if (!(requestedFiles.length < 1)) {
                _context3.next = 12;
                break;
              }
              return _context3.abrupt("return", cb(new Error('Could not find file corresponding to web seed range request')));
            case 12:
              requests = requestedFiles.map(function (requestedFile) {
                var fileEnd = requestedFile.offset + requestedFile.length - 1;
                var url = _this3.url + (_this3.url[_this3.url.length - 1] === '/' ? '' : '/') + requestedFile.path.replace(_this3._torrent.path, '');
                return {
                  url: url,
                  fileOffsetInRange: Math.max(requestedFile.offset - rangeStart, 0),
                  start: Math.max(rangeStart - requestedFile.offset, 0),
                  end: Math.min(fileEnd, rangeEnd - requestedFile.offset)
                };
              });
            case 13:
              _context3.prev = 13;
              _context3.next = 16;
              return Promise.all(requests.map( /*#__PURE__*/function () {
                var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(_ref2) {
                  var start, end, url, res, data;
                  return _regeneratorRuntime().wrap(function _callee2$(_context2) {
                    while (1) switch (_context2.prev = _context2.next) {
                      case 0:
                        start = _ref2.start, end = _ref2.end, url = _ref2.url;
                        debug$2('Requesting url=%s pieceIndex=%d offset=%d length=%d start=%d end=%d', url, pieceIndex, offset, length, start, end);
                        _context2.next = 4;
                        return fetch$1(url, {
                          cache: 'no-store',
                          method: 'GET',
                          headers: {
                            'Cache-Control': 'no-store',
                            'user-agent': "WebTorrent/".concat(VERSION, " (https://webtorrent.io)"),
                            range: "bytes=".concat(start, "-").concat(end)
                          },
                          signal: AbortSignal.timeout(SOCKET_TIMEOUT)
                        });
                      case 4:
                        res = _context2.sent;
                        if (res.ok) {
                          _context2.next = 7;
                          break;
                        }
                        throw new Error("Unexpected HTTP status code ".concat(res.status));
                      case 7:
                        _context2.t0 = Uint8Array;
                        _context2.next = 10;
                        return res.arrayBuffer();
                      case 10:
                        _context2.t1 = _context2.sent;
                        data = new _context2.t0(_context2.t1);
                        debug$2('Got data of length %d', data.length);
                        return _context2.abrupt("return", data);
                      case 14:
                      case "end":
                        return _context2.stop();
                    }
                  }, _callee2);
                }));
                return function (_x7) {
                  return _ref3.apply(this, arguments);
                };
              }()));
            case 16:
              chunks = _context3.sent;
              _context3.next = 22;
              break;
            case 19:
              _context3.prev = 19;
              _context3.t0 = _context3["catch"](13);
              return _context3.abrupt("return", cb(_context3.t0));
            case 22:
              cb(null, uint8Util.concat(chunks));
            case 23:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this, [[13, 19]]);
      }));
      function httpRequest(_x3, _x4, _x5, _x6) {
        return _httpRequest.apply(this, arguments);
      }
      return httpRequest;
    }()
  }, {
    key: "destroy",
    value: function destroy() {
      _get(_getPrototypeOf(WebConn.prototype), "destroy", this).call(this);
      this._torrent = null;
    }
  }]);
}(Wire);

/**
 * @typedef {Object} MinimalSelectionItem
 * @property {number} from
 * @property {number} to
 */

/** A selection of pieces to download.
 * @typedef {MinimalSelectionItem & {
 *  offset: number,
 *  priority: number,
 *  notify?: function
 *  isStreamSelection?: boolean
 * }} SelectionItem
 */

/**
 * @typedef {MinimalSelectionItem & {notify: function}} NotificationItem
 */

var Selections = /*#__PURE__*/function () {
  function Selections() {
    _classCallCheck(this, Selections);
    /** @type {Array<SelectionItem>} */
    _defineProperty(this, "_items", []);
  }
  return _createClass(Selections, [{
    key: "remove",
    value:
    /**
     * @param {MinimalSelectionItem & {isStreamSelection?: boolean}} item Interval to be removed from the selection
     */
    function remove(item) {
      for (var i = 0; i < this._items.length; i++) {
        var existing = this._items[i];
        if (existing.isStreamSelection) {
          if (item.isStreamSelection) {
            // If both are stream selections and they match, then we remove the first matching item, then we break the loop
            if (existing.from === item.from && existing.to === item.to) {
              this._items.splice(i, 1);
              // for stream selections, we only remove one item at a time
              // ergo we break the loop after removing the first matching item
              break;
            }
          } else {
            // we only remove stream selections when the `isStreamSelection` flag is true and they match
            continue;
          }
        } else {
          if (isLowerIntersecting(item, existing)) {
            existing.to = Math.max(item.from - 1, 0);
          } else if (isUpperIntersecting(item, existing)) {
            existing.from = item.to + 1;
          } else if (isInsideExisting(item, existing)) {
            var _this$_items;
            var replacingItems = [];
            var existingStart = _objectSpread2(_objectSpread2({}, existing), {}, {
              to: Math.max(item.from - 1, 0)
            });
            if (existingStart.to - existingStart.from >= 0 && item.from !== 0) replacingItems.push(existingStart);
            var existingEnd = _objectSpread2(_objectSpread2({}, existing), {}, {
              from: item.to + 1
            });
            if (existingEnd.to - existingEnd.from >= 0) replacingItems.push(existingEnd);
            (_this$_items = this._items).splice.apply(_this$_items, [i, 1].concat(replacingItems));
            i = i - 1 + replacingItems.length; // decrement i to offset splice
          } else if (isCoveringExisting(item, existing)) {
            this._items.splice(i, 1);
            i--;
          }
        }
      }
    }

    /**
     * @param {SelectionItem & NotificationItem} newItem
     */
  }, {
    key: "insert",
    value: function insert(newItem) {
      if (newItem.from > newItem.to) {
        throw new Error('Invalid interval');
      }
      if (!newItem.isStreamSelection) {
        var oldNotify = newItem.notify;
        // Merge notifications of intersecting items into the new item's notify function
        var intersectingNotifyFunctions = [];
        var _iterator = _createForOfIteratorHelper(this._items),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var existing = _step.value;
            if (existing.notify && isIntersecting(newItem, existing)) {
              intersectingNotifyFunctions.push(existing.notify);
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        if (intersectingNotifyFunctions.length > 0) {
          newItem.notify = function () {
            intersectingNotifyFunctions.forEach(function (fn) {
              return fn();
            });
            oldNotify === null || oldNotify === void 0 || oldNotify();
          };
        }
        // Remove or truncate intersecting items to make room for the new item
        this.remove(newItem);
      }
      this._items.push(newItem);
    }

    /** @param {(a: SelectionItem, b: SelectionItem) => number} sortFn */
  }, {
    key: "sort",
    value: function sort() {
      var sortFn = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function (a, b) {
        return a.from - b.from;
      };
      this._items.sort(sortFn);
    }
  }, {
    key: "length",
    get: function get() {
      return this._items.length;
    }

    /**  @param {number} index */
  }, {
    key: "get",
    value: function get(index) {
      return this._items[index];
    }
  }, {
    key: "swap",
    value: function swap(i, j) {
      var temp = this._items[i];
      this._items[i] = this._items[j];
      this._items[j] = temp;
    }
  }, {
    key: "clear",
    value: function clear() {
      this._items.length = 0;
    }

    /** @returns {Generator<SelectionItem & {remove: () => void, replaceWith: (MinimalSelectionItem[]) => void}>} */
  }, {
    key: Symbol.iterator,
    value:
    /*#__PURE__*/
    _regeneratorRuntime().mark(function value() {
      var _this = this;
      var _loop, i;
      return _regeneratorRuntime().wrap(function value$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            _loop = /*#__PURE__*/_regeneratorRuntime().mark(function _loop(_i) {
              var item;
              return _regeneratorRuntime().wrap(function _loop$(_context) {
                while (1) switch (_context.prev = _context.next) {
                  case 0:
                    item = _this._items[_i];
                    item.remove = function () {
                      _this._items.splice(_i, 1);
                      _i--;
                    };
                    _context.next = 4;
                    return item;
                  case 4:
                    delete item.remove;
                    i = _i;
                  case 6:
                  case "end":
                    return _context.stop();
                }
              }, _loop);
            });
            i = 0;
          case 2:
            if (!(i < this._items.length)) {
              _context2.next = 7;
              break;
            }
            return _context2.delegateYield(_loop(i), "t0", 4);
          case 4:
            i++;
            _context2.next = 2;
            break;
          case 7:
          case "end":
            return _context2.stop();
        }
      }, value, this);
    })
  }]);
}();

/**
 * Examples:
 * existing: 1-10 | 1-10
 * new_item: 8-12 | 10-15
 * @param {MinimalSelectionItem} newItem
 * @param {MinimalSelectionItem} existing
 * @returns {boolean} returns true if the new item's lower end is intersecting with the existing item
 */
function isLowerIntersecting(newItem, existing) {
  return newItem.from <= existing.to && newItem.from > existing.from && newItem.to > existing.to;
}

/**
 * Examples:
 * existing: 20-25 | 20-25
 * new_item: 15-22 | 15-20
 * @param {MinimalSelectionItem} newItem
 * @param {MinimalSelectionItem} existing
 * @returns {boolean} returns true if the new item's upper end is intersecting with the existing item
 */
function isUpperIntersecting(newItem, existing) {
  return newItem.to >= existing.from && newItem.to < existing.to && newItem.from < existing.from;
}

/**
 * Examples:
 * existing: 10-20 | 10-20 | 10-20
 * new_item: 12-15 | 20-20 | 15-20
 * @param {MinimalSelectionItem} newItem
 * @param {MinimalSelectionItem} existing
 * @returns {boolean} returns true if the new item is completely inside the existing item
 */
function isInsideExisting(newItem, existing) {
  var existingIntervalSize = existing.to - existing.from;
  var newItemIntervalSize = newItem.to - newItem.from;
  return newItem.from >= existing.from && newItem.to <= existing.to && newItemIntervalSize < existingIntervalSize;
}

/**
 * Examples:
 * existing: 10-20 | 10-20 | 10-20
 * new_item: 10-21 | 09-20 | 10-20
 * @param {MinimalSelectionItem} newItem
 * @param {MinimalSelectionItem} existing
 * @returns {boolean} returns true if the new item is covering the existing item
 */
function isCoveringExisting(newItem, existing) {
  return newItem.from <= existing.from && newItem.to >= existing.to;
}
var isIntersecting = function isIntersecting(newItem, existing) {
  return function () {
    return isLowerIntersecting(newItem, existing) || isUpperIntersecting(newItem, existing) || isInsideExisting(newItem, existing) || isCoveringExisting(newItem, existing);
  };
};

var _navigator$storage, _FileSystemFileHandle;
var debug$1 = debugFactory('webtorrent:torrent');
var MAX_BLOCK_LENGTH = 128 * 1024;
var PIECE_TIMEOUT = 30000;
var CHOKE_TIMEOUT = 5000;
var SPEED_THRESHOLD = 3 * Piece.BLOCK_LENGTH;
var PIPELINE_MIN_DURATION = 0.5;
var PIPELINE_MAX_DURATION = 1;
var RECHOKE_INTERVAL = 10000; // 10 seconds
var RECHOKE_OPTIMISTIC_DURATION = 2; // 30 seconds

var DEFAULT_NO_PEERS_INTERVAL = 30000; // 30 seconds

// IndexedDB chunk stores used in the browser benefit from high concurrency
var FILESYSTEM_CONCURRENCY = process.browser ? cpus().length : 2;
var RECONNECT_WAIT = [1000, 5000, 15000];
var USER_AGENT = "WebTorrent/".concat(VERSION, " (https://webtorrent.io)");
var SUPPORTS_FSA = typeof navigator !== 'undefined' && ((_navigator$storage = navigator.storage) === null || _navigator$storage === void 0 ? void 0 : _navigator$storage.getDirectory) && typeof FileSystemFileHandle !== 'undefined' && ((_FileSystemFileHandle = FileSystemFileHandle) === null || _FileSystemFileHandle === void 0 || (_FileSystemFileHandle = _FileSystemFileHandle.prototype) === null || _FileSystemFileHandle === void 0 ? void 0 : _FileSystemFileHandle.createWritable);
var FALLBACK_STORE = !process.browser || SUPPORTS_FSA ? FSChunkStore // Node or browser with FSA
: MemoryChunkStore;
var TMP;
try {
  TMP = path.join(fs.statSync('/tmp') && '/tmp', 'webtorrent');
} catch (err) {
  TMP = path.join(typeof os.tmpdir === 'function' ? os.tmpdir() : '/', 'webtorrent');
}
var IDLE_CALLBACK = typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function' && window.requestIdleCallback;
var Torrent = /*#__PURE__*/function (_EventEmitter) {
  function Torrent(torrentId, client, opts) {
    var _opts$alwaysChokeSeed;
    var _this;
    _classCallCheck(this, Torrent);
    _this = _callSuper(this, Torrent);
    _this._debugId = 'unknown infohash';
    _this.client = client;
    _this.announce = opts.announce;
    _this.urlList = opts.urlList;
    _this.path = opts.path || TMP;
    _this.addUID = opts.addUID || false;
    _this.rootDir = opts.rootDir || null;
    _this.skipVerify = !!opts.skipVerify;
    _this._store = opts.store || FALLBACK_STORE;
    _this._preloadedStore = opts.preloadedStore || null;
    _this._storeCacheSlots = opts.storeCacheSlots !== undefined ? opts.storeCacheSlots : 20;
    _this._destroyStoreOnDestroy = opts.destroyStoreOnDestroy || false;
    _this.store = null;
    _this.storeOpts = opts.storeOpts;
    _this.alwaysChokeSeeders = (_opts$alwaysChokeSeed = opts.alwaysChokeSeeders) !== null && _opts$alwaysChokeSeed !== void 0 ? _opts$alwaysChokeSeed : true;
    _this._getAnnounceOpts = opts.getAnnounceOpts;

    // if defined, `opts.private` overrides default privacy of torrent
    if (typeof opts["private"] === 'boolean') _this["private"] = opts["private"];
    _this.strategy = opts.strategy || 'sequential';
    _this.maxWebConns = opts.maxWebConns || 4;
    _this._rechokeNumSlots = opts.uploads === false || opts.uploads === 0 ? 0 : +opts.uploads || 10;
    _this._rechokeOptimisticWire = null;
    _this._rechokeOptimisticTime = 0;
    _this._rechokeIntervalId = null;
    _this._noPeersIntervalId = null;
    _this._noPeersIntervalTime = opts.noPeersIntervalTime ? opts.noPeersIntervalTime * 1000 : DEFAULT_NO_PEERS_INTERVAL;
    _this._startAsDeselected = opts.deselect || false;
    _this.ready = false;
    _this.destroyed = false;
    _this.paused = opts.paused || false;
    _this.done = false;
    _this.metadata = null;
    _this.files = [];

    // Pieces that need to be downloaded, indexed by piece index
    _this.pieces = [];
    _this._amInterested = false;
    _this._selections = new Selections();
    _this._critical = [];
    _this.wires = []; // open wires (added *after* handshake)

    _this._queue = []; // queue of outgoing tcp peers to connect to
    _this._peers = {}; // connected peers (addr/peerId -> Peer)
    _this._peersLength = 0; // number of elements in `this._peers` (cache, for perf)

    // stats
    _this.received = 0;
    _this.uploaded = 0;
    _this._downloadSpeed = throughput();
    _this._uploadSpeed = throughput();

    // for cleanup
    _this._servers = [];
    _this._xsRequests = [];

    // TODO: remove this and expose a hook instead
    // optimization: don't recheck every file if it hasn't changed
    _this._fileModtimes = opts.fileModtimes;
    if (torrentId !== null) _this._onTorrentId(torrentId);
    _this._debug('new torrent');
    return _this;
  }
  _inherits(Torrent, _EventEmitter);
  return _createClass(Torrent, [{
    key: "timeRemaining",
    get: function get() {
      if (this.done) return 0;
      if (this.downloadSpeed === 0) return Infinity;
      return (this.length - this.downloaded) / this.downloadSpeed * 1000;
    }
  }, {
    key: "downloaded",
    get: function get() {
      if (!this.bitfield) return 0;
      var downloaded = 0;
      for (var index = 0, len = this.pieces.length; index < len; ++index) {
        if (this.bitfield.get(index)) {
          // verified data
          downloaded += index === len - 1 ? this.lastPieceLength : this.pieceLength;
        } else {
          // "in progress" data
          var piece = this.pieces[index];
          downloaded += piece.length - piece.missing;
        }
      }
      return downloaded;
    }

    // TODO: re-enable this. The number of missing pieces. Used to implement 'end game' mode.
    // Object.defineProperty(Storage.prototype, 'numMissing', {
    //   get: function () {
    //     var self = this
    //     var numMissing = self.pieces.length
    //     for (var index = 0, len = self.pieces.length; index < len; index++) {
    //       numMissing -= self.bitfield.get(index)
    //     }
    //     return numMissing
    //   }
    // })
  }, {
    key: "downloadSpeed",
    get: function get() {
      return this._downloadSpeed();
    }
  }, {
    key: "uploadSpeed",
    get: function get() {
      return this._uploadSpeed();
    }
  }, {
    key: "progress",
    get: function get() {
      return this.length ? this.downloaded / this.length : 0;
    }
  }, {
    key: "ratio",
    get: function get() {
      return this.uploaded / (this.received || this.length);
    }
  }, {
    key: "numPeers",
    get: function get() {
      return this.wires.length;
    }
  }, {
    key: "torrentFileBlob",
    get: function get() {
      if (!this.torrentFile) return null;
      return new Blob([this.torrentFile], {
        type: 'application/x-bittorrent'
      });
    }
  }, {
    key: "_numQueued",
    get: function get() {
      return this._queue.length + (this._peersLength - this._numConns);
    }
  }, {
    key: "_numConns",
    get: function get() {
      var numConns = 0;
      for (var id in this._peers) {
        if (this._peers[id].connected) numConns += 1;
      }
      return numConns;
    }
  }, {
    key: "_onTorrentId",
    value: function () {
      var _onTorrentId2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(torrentId) {
        var _this2 = this;
        var parsedTorrent;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              if (!this.destroyed) {
                _context.next = 2;
                break;
              }
              return _context.abrupt("return");
            case 2:
              _context.prev = 2;
              _context.next = 5;
              return parseTorrent(torrentId);
            case 5:
              parsedTorrent = _context.sent;
              _context.next = 10;
              break;
            case 8:
              _context.prev = 8;
              _context.t0 = _context["catch"](2);
            case 10:
              if (parsedTorrent) {
                // Attempt to set infoHash property synchronously
                this.infoHash = parsedTorrent.infoHash;
                this._debugId = uint8Util.arr2hex(parsedTorrent.infoHash).substring(0, 7);
                queueMicrotask(function () {
                  if (_this2.destroyed) return;
                  _this2._onParsedTorrent(parsedTorrent);
                });
              } else {
                // If torrentId failed to parse, it could be in a form that requires an async
                // operation, i.e. http/https link, filesystem path, or Blob.
                parseTorrent.remote(torrentId, function (err, parsedTorrent) {
                  if (_this2.destroyed) return;
                  if (err) return _this2._destroy(err);
                  _this2._onParsedTorrent(parsedTorrent);
                });
              }
            case 11:
            case "end":
              return _context.stop();
          }
        }, _callee, this, [[2, 8]]);
      }));
      function _onTorrentId(_x) {
        return _onTorrentId2.apply(this, arguments);
      }
      return _onTorrentId;
    }()
  }, {
    key: "_onParsedTorrent",
    value: function _onParsedTorrent(parsedTorrent) {
      var _this3 = this;
      if (this.destroyed) return;
      this._processParsedTorrent(parsedTorrent);
      if (!this.infoHash) {
        return this._destroy(new Error('Malformed torrent data: No info hash'));
      }
      this._rechokeIntervalId = setInterval(function () {
        _this3._rechoke();
      }, RECHOKE_INTERVAL);
      if (this._rechokeIntervalId.unref) this._rechokeIntervalId.unref();

      // Private 'infoHash' event allows client.add to check for duplicate torrents and
      // destroy them before the normal 'infoHash' event is emitted. Prevents user
      // applications from needing to deal with duplicate 'infoHash' events.
      this.emit('_infoHash', this.infoHash);
      if (this.destroyed) return;
      this.emit('infoHash', this.infoHash);
      if (this.destroyed) return; // user might destroy torrent in event handler

      if (this.client.listening) {
        this._onListening();
      } else {
        this.client.once('listening', function () {
          _this3._onListening();
        });
      }
    }
  }, {
    key: "_processParsedTorrent",
    value: function _processParsedTorrent(parsedTorrent) {
      this._debugId = uint8Util.arr2hex(parsedTorrent.infoHash).substring(0, 7);
      if (typeof this["private"] !== 'undefined') {
        // `private` option overrides default, only if it's defined
        parsedTorrent["private"] = this["private"];
      }
      if (Array.isArray(this.announce)) {
        // Allow specifying trackers via `opts` parameter
        parsedTorrent.announce = parsedTorrent.announce.concat(this.announce);
      }
      if (this.client.tracker && Array.isArray(this.client.tracker.announce) && !parsedTorrent["private"]) {
        // If the client has a default tracker, add it to the announce list if torrent is not private
        parsedTorrent.announce = parsedTorrent.announce.concat(this.client.tracker.announce);
      }
      if (this.client.tracker && global.WEBTORRENT_ANNOUNCE && !parsedTorrent["private"]) {
        // So `webtorrent-hybrid` can force specific trackers to be used
        parsedTorrent.announce = parsedTorrent.announce.concat(global.WEBTORRENT_ANNOUNCE);
      }
      if (this.urlList) {
        // Allow specifying web seeds via `opts` parameter
        parsedTorrent.urlList = parsedTorrent.urlList.concat(this.urlList);
      }

      // remove duplicates by converting to Set and back
      parsedTorrent.announce = Array.from(new Set(parsedTorrent.announce));
      parsedTorrent.urlList = Array.from(new Set(parsedTorrent.urlList));
      Object.assign(this, parsedTorrent);
      this.magnetURI = parseTorrent.toMagnetURI(parsedTorrent);
      this.torrentFile = parseTorrent.toTorrentFile(parsedTorrent);
    }
  }, {
    key: "_onListening",
    value: function _onListening() {
      if (this.destroyed) return;
      if (this.info) {
        // if full metadata was included in initial torrent id, use it immediately. Otherwise,
        // wait for torrent-discovery to find peers and ut_metadata to get the metadata.
        this._onMetadata(this);
      } else {
        if (this.xs) this._getMetadataFromServer();
        this._startDiscovery();
      }
    }
  }, {
    key: "_startDiscovery",
    value: function _startDiscovery() {
      var _this4 = this;
      if (this.discovery || this.destroyed) return;
      var trackerOpts = this.client.tracker;
      if (trackerOpts) {
        trackerOpts = Object.assign({}, this.client.tracker, {
          getAnnounceOpts: function getAnnounceOpts() {
            if (_this4.destroyed) return;
            var opts = {
              uploaded: _this4.uploaded,
              downloaded: _this4.downloaded,
              left: Math.max(_this4.length - _this4.downloaded, 0)
            };
            if (_this4.client.tracker.getAnnounceOpts) {
              Object.assign(opts, _this4.client.tracker.getAnnounceOpts());
            }
            if (_this4._getAnnounceOpts) {
              // TODO: consider deprecating this, as it's redundant with the former case
              Object.assign(opts, _this4._getAnnounceOpts());
            }
            return opts;
          }
        });
      }

      // add BEP09 peer-address
      if (this.peerAddresses) {
        this.peerAddresses.forEach(function (peer) {
          return _this4.addPeer(peer, Peer.SOURCE_MANUAL);
        });
      }

      // begin discovering peers via DHT and trackers
      this.discovery = new Discovery({
        infoHash: this.infoHash,
        announce: this.announce,
        peerId: this.client.peerId,
        dht: !this["private"] && this.client.dht,
        tracker: trackerOpts,
        port: this.client.torrentPort,
        userAgent: USER_AGENT,
        lsd: this.client.lsd
      });
      this.discovery.on('error', function (err) {
        _this4._destroy(err);
      });
      this.discovery.on('peer', function (peer, source) {
        _this4._debug('peer %s discovered via %s', peer, source);
        // Don't create new outgoing connections when torrent is done and seedOutgoingConnections is false.
        if (!_this4.client.seedOutgoingConnections && _this4.done) {
          _this4._debug('ignoring peer %s: torrent is done and seedOutgoingConnections is false', peer);
          return;
        }
        _this4.addPeer(peer, source);
      });
      this.discovery.on('trackerAnnounce', function () {
        _this4.emit('trackerAnnounce');
      });
      this.discovery.on('dhtAnnounce', function () {
        _this4.emit('dhtAnnounce');
      });
      this.discovery.on('warning', function (err) {
        _this4.emit('warning', err);
      });
      this._noPeersIntervalId = setInterval(function () {
        if (_this4.destroyed) return;
        var counters = _defineProperty(_defineProperty(_defineProperty(_defineProperty({}, Peer.SOURCE_TRACKER, {
          enabled: !!_this4.client.tracker,
          numPeers: 0
        }), Peer.SOURCE_DHT, {
          enabled: !!_this4.client.dht,
          numPeers: 0
        }), Peer.SOURCE_LSD, {
          enabled: !!_this4.client.lsd,
          numPeers: 0
        }), Peer.SOURCE_UT_PEX, {
          enabled: _this4.client.utPex && typeof utPex === 'function',
          numPeers: 0
        });
        for (var _i = 0, _Object$values = Object.values(_this4._peers); _i < _Object$values.length; _i++) {
          var peer = _Object$values[_i];
          var counter = counters[peer.source];
          if (typeof counter !== 'undefined') counter.numPeers++;
        }
        for (var _i2 = 0, _Object$keys = Object.keys(counters); _i2 < _Object$keys.length; _i2++) {
          var source = _Object$keys[_i2];
          var _counter = counters[source];
          if (_counter.enabled && _counter.numPeers === 0) _this4.emit('noPeers', source);
        }
      }, this._noPeersIntervalTime);
      if (this._noPeersIntervalId.unref) this._noPeersIntervalId.unref();
    }
  }, {
    key: "_getMetadataFromServer",
    value: function _getMetadataFromServer() {
      // to allow function hoisting
      var self = this;
      var urls = Array.isArray(this.xs) ? this.xs : [this.xs];
      self._xsRequestsController = new AbortController();
      var signal = self._xsRequestsController.signal;
      var tasks = urls.map(function (url) {
        return function (cb) {
          getMetadataFromURL(url, cb);
        };
      });
      parallel(tasks);
      function getMetadataFromURL(_x2, _x3) {
        return _getMetadataFromURL.apply(this, arguments);
      }
      function _getMetadataFromURL() {
        _getMetadataFromURL = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(url, cb) {
          var opts, res, torrent, parsedTorrent;
          return _regeneratorRuntime().wrap(function _callee2$(_context2) {
            while (1) switch (_context2.prev = _context2.next) {
              case 0:
                if (!(url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0)) {
                  _context2.next = 3;
                  break;
                }
                self.emit('warning', new Error("skipping non-http xs param: ".concat(url)));
                return _context2.abrupt("return", cb(null));
              case 3:
                opts = {
                  method: 'GET',
                  headers: {
                    'user-agent': USER_AGENT
                  },
                  signal: signal
                };
                _context2.prev = 4;
                _context2.next = 7;
                return fetch$1(url, opts);
              case 7:
                res = _context2.sent;
                _context2.next = 14;
                break;
              case 10:
                _context2.prev = 10;
                _context2.t0 = _context2["catch"](4);
                self.emit('warning', new Error("http error from xs param: ".concat(url)));
                return _context2.abrupt("return", cb(null));
              case 14:
                if (!self.destroyed) {
                  _context2.next = 16;
                  break;
                }
                return _context2.abrupt("return", cb(null));
              case 16:
                if (!self.metadata) {
                  _context2.next = 18;
                  break;
                }
                return _context2.abrupt("return", cb(null));
              case 18:
                if (!(res.status !== 200)) {
                  _context2.next = 21;
                  break;
                }
                self.emit('warning', new Error("non-200 status code ".concat(res.status, " from xs param: ").concat(url)));
                return _context2.abrupt("return", cb(null));
              case 21:
                _context2.prev = 21;
                _context2.t1 = Uint8Array;
                _context2.next = 25;
                return res.arrayBuffer();
              case 25:
                _context2.t2 = _context2.sent;
                torrent = new _context2.t1(_context2.t2);
                _context2.next = 33;
                break;
              case 29:
                _context2.prev = 29;
                _context2.t3 = _context2["catch"](21);
                self.emit('warning', _context2.t3);
                return _context2.abrupt("return", cb(null));
              case 33:
                _context2.prev = 33;
                _context2.next = 36;
                return parseTorrent(torrent);
              case 36:
                parsedTorrent = _context2.sent;
                _context2.next = 41;
                break;
              case 39:
                _context2.prev = 39;
                _context2.t4 = _context2["catch"](33);
              case 41:
                if (parsedTorrent) {
                  _context2.next = 44;
                  break;
                }
                self.emit('warning', new Error("got invalid torrent file from xs param: ".concat(url)));
                return _context2.abrupt("return", cb(null));
              case 44:
                if (!(parsedTorrent.infoHash !== self.infoHash)) {
                  _context2.next = 47;
                  break;
                }
                self.emit('warning', new Error("got torrent file with incorrect info hash from xs param: ".concat(url)));
                return _context2.abrupt("return", cb(null));
              case 47:
                self._onMetadata(parsedTorrent);
                cb(null);
              case 49:
              case "end":
                return _context2.stop();
            }
          }, _callee2, null, [[4, 10], [21, 29], [33, 39]]);
        }));
        return _getMetadataFromURL.apply(this, arguments);
      }
    }

    /**
     * Called when the full torrent metadata is received.
     */
  }, {
    key: "_onMetadata",
    value: (function () {
      var _onMetadata2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(metadata) {
        var _this$_xsRequestsCont,
          _this5 = this;
        var parsedTorrent, rawStore, onPiecesVerified;
        return _regeneratorRuntime().wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              if (!(this.metadata || this.destroyed)) {
                _context3.next = 2;
                break;
              }
              return _context3.abrupt("return");
            case 2:
              this._debug('got metadata');
              (_this$_xsRequestsCont = this._xsRequestsController) === null || _this$_xsRequestsCont === void 0 || _this$_xsRequestsCont.abort();
              this._xsRequestsController = null;
              if (!(metadata && metadata.infoHash)) {
                _context3.next = 9;
                break;
              }
              // `metadata` is a parsed torrent (from parse-torrent module)
              parsedTorrent = metadata;
              _context3.next = 18;
              break;
            case 9:
              _context3.prev = 9;
              _context3.next = 12;
              return parseTorrent(metadata);
            case 12:
              parsedTorrent = _context3.sent;
              _context3.next = 18;
              break;
            case 15:
              _context3.prev = 15;
              _context3.t0 = _context3["catch"](9);
              return _context3.abrupt("return", this._destroy(_context3.t0));
            case 18:
              this._processParsedTorrent(parsedTorrent);
              this.metadata = this.torrentFile;

              // add web seed urls (BEP19)
              if (this.client.enableWebSeeds) {
                this.urlList.forEach(function (url) {
                  _this5.addWebSeed(url);
                });
              }
              this._rarityMap = new RarityMap(this);
              this.files = this.files.map(function (file) {
                return new File(_this5, file);
              });
              rawStore = this._preloadedStore;
              if (!rawStore) {
                rawStore = new this._store(this.pieceLength, _objectSpread2(_objectSpread2({}, this.storeOpts), {}, {
                  torrent: this,
                  path: this.path,
                  files: this.files,
                  length: this.length,
                  name: this.name + ' - ' + this.infoHash.slice(0, 8),
                  addUID: this.addUID,
                  rootDir: this.rootDir,
                  max: this._storeCacheSlots
                }));
              }

              // don't use the cache if the store is already in memory
              if (this._storeCacheSlots > 0 && !(rawStore instanceof MemoryChunkStore)) {
                rawStore = new CacheChunkStore(rawStore, {
                  max: this._storeCacheSlots
                });
              }
              this.store = new ImmediateChunkStore(rawStore);

              // Select only specified files (BEP53) http://www.bittorrent.org/beps/bep_0053.html
              if (this.so && !this._startAsDeselected) {
                this.files.forEach(function (v, i) {
                  if (_this5.so.includes(i)) {
                    _this5.files[i].select();
                  }
                });
              } else {
                // start off selecting the entire torrent with low priority
                if (this.pieces.length !== 0 && !this._startAsDeselected) {
                  this.select(0, this.pieces.length - 1, 0);
                }
              }
              this._hashes = this.pieces;
              this.pieces = this.pieces.map(function (hash, i) {
                var pieceLength = i === _this5.pieces.length - 1 ? _this5.lastPieceLength : _this5.pieceLength;
                return new Piece(pieceLength);
              });
              this._reservations = this.pieces.map(function () {
                return [];
              });
              this.bitfield = new BitField(this.pieces.length);

              // Emit 'metadata' before 'ready' and 'done'
              this.emit('metadata');

              // User might destroy torrent in response to 'metadata' event
              if (!this.destroyed) {
                _context3.next = 35;
                break;
              }
              return _context3.abrupt("return");
            case 35:
              if (this.skipVerify) {
                // Skip verifying exisitng data and just assume it's correct
                this._markAllVerified();
                this._onStore();
              } else {
                onPiecesVerified = function onPiecesVerified(err) {
                  if (err) return _this5._destroy(err);
                  _this5._debug('done verifying');
                  _this5._onStore();
                };
                this._debug('verifying existing torrent data');
                if (this._fileModtimes && this._store === FSChunkStore) {
                  // don't verify if the files haven't been modified since we last checked
                  this.getFileModtimes(function (err, fileModtimes) {
                    if (err) return _this5._destroy(err);
                    var unchanged = _this5.files.map(function (_, index) {
                      return fileModtimes[index] === _this5._fileModtimes[index];
                    }).every(function (x) {
                      return x;
                    });
                    if (unchanged) {
                      _this5._markAllVerified();
                      _this5._onStore();
                    } else {
                      _this5._verifyPieces(onPiecesVerified);
                    }
                  });
                } else {
                  this._verifyPieces(onPiecesVerified);
                }
              }
            case 36:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this, [[9, 15]]);
      }));
      function _onMetadata(_x4) {
        return _onMetadata2.apply(this, arguments);
      }
      return _onMetadata;
    }()
    /*
     * TODO: remove this
     * Gets the last modified time of every file on disk for this torrent.
     * Only valid in Node, not in the browser.
     */
    )
  }, {
    key: "getFileModtimes",
    value: function getFileModtimes(cb) {
      var _this6 = this;
      var ret = [];
      parallelLimit(this.files.map(function (file, index) {
        return function (cb) {
          var filePath = _this6.addUID ? path.join(_this6.name + ' - ' + _this6.infoHash.slice(0, 8)) : path.join(_this6.path, file.path);
          fs.stat(filePath, function (err, stat) {
            if (err && err.code !== 'ENOENT') return cb(err);
            ret[index] = stat && stat.mtime.getTime();
            cb(null);
          });
        };
      }), FILESYSTEM_CONCURRENCY, function (err) {
        _this6._debug('done getting file modtimes');
        cb(err, ret);
      });
    }
  }, {
    key: "_verifyPieces",
    value: function _verifyPieces(cb) {
      var _this7 = this;
      parallelLimit(this.pieces.map(function (piece, index) {
        return function (cb) {
          if (_this7.destroyed) return cb(new Error('torrent is destroyed'));
          var getOpts = {};
          // Specify length for the last piece in case it is zero-padded
          if (index === _this7.pieces.length - 1) {
            getOpts.length = _this7.lastPieceLength;
          }
          _this7.store.get(index, getOpts, /*#__PURE__*/function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(err, buf) {
              var hex;
              return _regeneratorRuntime().wrap(function _callee4$(_context4) {
                while (1) switch (_context4.prev = _context4.next) {
                  case 0:
                    if (!_this7.destroyed) {
                      _context4.next = 2;
                      break;
                    }
                    return _context4.abrupt("return", cb(new Error('torrent is destroyed')));
                  case 2:
                    if (!err) {
                      _context4.next = 4;
                      break;
                    }
                    return _context4.abrupt("return", queueMicrotask(function () {
                      return cb(null);
                    }));
                  case 4:
                    _context4.next = 6;
                    return uint8Util.hash(buf, 'hex');
                  case 6:
                    hex = _context4.sent;
                    if (!_this7.destroyed) {
                      _context4.next = 9;
                      break;
                    }
                    return _context4.abrupt("return", cb(new Error('torrent is destroyed')));
                  case 9:
                    if (hex === _this7._hashes[index]) {
                      _this7._debug('piece verified %s', index);
                      _this7._markVerified(index);
                    } else {
                      _this7._markUnverified(index);
                      _this7._debug('piece invalid %s', index);
                    }
                    cb(null);
                  case 11:
                  case "end":
                    return _context4.stop();
                }
              }, _callee4);
            }));
            return function (_x5, _x6) {
              return _ref.apply(this, arguments);
            };
          }());
        };
      }), FILESYSTEM_CONCURRENCY, cb);
    }
  }, {
    key: "rescanFiles",
    value: function rescanFiles(cb) {
      var _this8 = this;
      if (this.destroyed) throw new Error('torrent is destroyed');
      if (!cb) cb = noop;
      this._verifyPieces(function (err) {
        if (err) {
          _this8._destroy(err);
          return cb(err);
        }
        _this8._checkDone();
        cb(null);
      });
    }
  }, {
    key: "_markAllVerified",
    value: function _markAllVerified() {
      for (var index = 0; index < this.pieces.length; index++) {
        this._markVerified(index);
      }
    }
  }, {
    key: "_markVerified",
    value: function _markVerified(index) {
      this.pieces[index] = null;
      this._reservations[index] = null;
      this.bitfield.set(index, true);
      this.emit('verified', index);
    }
  }, {
    key: "_markUnverified",
    value: function _markUnverified(index) {
      var len = index === this.pieces.length - 1 ? this.lastPieceLength : this.pieceLength;
      this.pieces[index] = new Piece(len);
      this.bitfield.set(index, false);
      if (!this._startAsDeselected) this.select(index, index, 1);
      this.files.forEach(function (file) {
        if (file.done && file.includes(index)) file.done = false;
      });
    }
  }, {
    key: "_hasAllPieces",
    value: function _hasAllPieces() {
      for (var index = 0; index < this.pieces.length; index++) {
        if (!this.bitfield.get(index)) return false;
      }
      return true;
    }
  }, {
    key: "_hasNoPieces",
    value: function _hasNoPieces() {
      return !this._hasMorePieces(0);
    }
  }, {
    key: "_hasMorePieces",
    value: function _hasMorePieces(threshold) {
      var count = 0;
      for (var index = 0; index < this.pieces.length; index++) {
        if (this.bitfield.get(index)) {
          count += 1;
          if (count > threshold) return true;
        }
      }
      return false;
    }

    /**
     * Called when the metadata, listening server, and underlying chunk store is initialized.
     */
  }, {
    key: "_onStore",
    value: function _onStore() {
      var _this9 = this;
      if (this.destroyed) return;
      this._debug('on store');

      // Start discovery before emitting 'ready'
      this._startDiscovery();
      this.ready = true;
      this.emit('ready');

      // Files may start out done if the file was already in the store
      this._checkDone();

      // In case any selections were made before torrent was ready
      this._updateSelections();

      // Start requesting pieces after we have initially verified them
      this.wires.forEach(function (wire) {
        // If we didn't have the metadata at the time ut_metadata was initialized for this
        // wire, we still want to make it available to the peer in case they request it.
        if (wire.ut_metadata) wire.ut_metadata.setMetadata(_this9.metadata);
        _this9._onWireWithMetadata(wire);
      });
    }
  }, {
    key: "destroy",
    value: function destroy(opts, cb) {
      if (typeof opts === 'function') return this.destroy(null, opts);
      this._destroy(null, opts, cb);
    }
  }, {
    key: "_destroy",
    value: function _destroy(err, opts, cb) {
      var _this$_xsRequestsCont2,
        _this10 = this;
      if (typeof opts === 'function') return this._destroy(err, null, opts);
      if (this.destroyed) return;
      this.destroyed = true;
      this._debug('destroy');
      this.client._remove(this);
      this._selections.clear();
      clearInterval(this._rechokeIntervalId);
      clearInterval(this._noPeersIntervalId);
      (_this$_xsRequestsCont2 = this._xsRequestsController) === null || _this$_xsRequestsCont2 === void 0 || _this$_xsRequestsCont2.abort();
      if (this._rarityMap) {
        this._rarityMap.destroy();
      }
      for (var id in this._peers) {
        this.removePeer(id);
      }
      this.files.forEach(function (file) {
        if (file instanceof File) file._destroy();
      });
      var tasks = this._servers.map(function (server) {
        return function (cb) {
          server.destroy(cb);
        };
      });
      if (this.discovery) {
        tasks.push(function (cb) {
          _this10.discovery.destroy(cb);
        });
      }
      if (this.store) {
        var destroyStore = this._destroyStoreOnDestroy;
        if (opts && opts.destroyStore !== undefined) {
          destroyStore = opts.destroyStore;
        }
        tasks.push(function (cb) {
          if (destroyStore) {
            _this10.store.destroy(cb);
          } else {
            _this10.store.close(cb);
          }
        });
      }
      parallel(tasks, cb);
      if (err) {
        // Torrent errors are emitted at `torrent.on('error')`. If there are no 'error'
        // event handlers on the torrent instance, then the error will be emitted at
        // `client.on('error')`. This prevents throwing an uncaught exception
        // (unhandled 'error' event), but it makes it impossible to distinguish client
        // errors versus torrent errors. Torrent errors are not fatal, and the client
        // is still usable afterwards. Therefore, always listen for errors in both
        // places (`client.on('error')` and `torrent.on('error')`).
        if (this.listenerCount('error') === 0) {
          this.client.emit('error', err);
        } else {
          this.emit('error', err);
        }
      }
      this.emit('close');
      this.client = null;
      this.files = [];
      this.discovery = null;
      this.store = null;
      this._rarityMap = null;
      this._peers = null;
      this._servers = null;
      this._xsRequests = null;
    }
  }, {
    key: "addPeer",
    value: function addPeer(peer, source) {
      if (this.destroyed) throw new Error('torrent is destroyed');
      if (!this.infoHash) throw new Error('addPeer() must not be called before the `infoHash` event');
      var host;
      if (this.client.blocked) {
        if (typeof peer === 'string') {
          var parts;
          try {
            parts = addrToIPPort(peer);
          } catch (e) {
            this._debug('ignoring peer: invalid %s', peer);
            this.emit('invalidPeer', peer);
            return false;
          }
          host = parts[0];
        } else if (typeof peer.remoteAddress === 'string') {
          host = peer.remoteAddress;
        }
        if (host && this.client.blocked.contains(host)) {
          this._debug('ignoring peer: blocked %s', peer);
          if (typeof peer !== 'string') peer.destroy();
          this.emit('blockedPeer', peer);
          return false;
        }
      }

      // if the utp connection fails to connect, then it is replaced with a tcp connection to the same ip:port

      var type = this.client.utp && this._isIPv4(host) ? 'utp' : 'tcp';
      var wasAdded = !!this._addPeer(peer, type, source);
      if (wasAdded) {
        this.emit('peer', peer);
      } else {
        this.emit('invalidPeer', peer);
      }
      return wasAdded;
    }
  }, {
    key: "_addPeer",
    value: function _addPeer(peer, type, source) {
      if (this.destroyed) {
        if (typeof peer !== 'string') peer.destroy();
        return null;
      }
      if (typeof peer === 'string' && !this._validAddr(peer)) {
        this._debug('ignoring peer: invalid %s', peer);
        return null;
      }
      var id = peer && peer.id || peer;
      if (this._peers[id]) {
        this._debug('ignoring peer: duplicate (%s)', id);
        if (typeof peer !== 'string') peer.destroy();
        return null;
      }
      if (this.paused) {
        this._debug('ignoring peer: torrent is paused');
        if (typeof peer !== 'string') peer.destroy();
        return null;
      }
      this._debug('add peer %s', id);
      var newPeer;
      if (typeof peer === 'string') {
        // `peer` is an addr ("ip:port" string)
        newPeer = type === 'utp' ? Peer.createUTPOutgoingPeer(peer, this, this.client.throttleGroups) : Peer.createTCPOutgoingPeer(peer, this, this.client.throttleGroups);
      } else {
        // `peer` is a WebRTC connection (simple-peer)
        newPeer = Peer.createWebRTCPeer(peer, this, this.client.throttleGroups);
      }
      this._registerPeer(newPeer);
      if (typeof peer === 'string') {
        // `peer` is an addr ("ip:port" string)
        this._queue.push(newPeer);
        this._drain();
      }
      return newPeer;
    }
  }, {
    key: "addWebSeed",
    value: function addWebSeed(urlOrConn) {
      if (this.destroyed) throw new Error('torrent is destroyed');
      var id;
      var conn;
      if (typeof urlOrConn === 'string') {
        id = urlOrConn;
        if (!/^https?:\/\/.+/.test(id)) {
          this.emit('warning', new Error("ignoring invalid web seed: ".concat(id)));
          this.emit('invalidPeer', id);
          return;
        }
        if (this._peers[id]) {
          this.emit('warning', new Error("ignoring duplicate web seed: ".concat(id)));
          this.emit('invalidPeer', id);
          return;
        }
        conn = new WebConn(id, this);
      } else if (urlOrConn && typeof urlOrConn.connId === 'string') {
        conn = urlOrConn;
        id = conn.connId;
        if (this._peers[id]) {
          this.emit('warning', new Error("ignoring duplicate web seed: ".concat(id)));
          this.emit('invalidPeer', id);
          return;
        }
      } else {
        this.emit('warning', new Error('addWebSeed must be passed a string or connection object with id property'));
        return;
      }
      this._debug('add web seed %s', id);
      var newPeer = Peer.createWebSeedPeer(conn, id, this, this.client.throttleGroups);
      this._registerPeer(newPeer);
      this.emit('peer', id);
    }

    /**
     * Called whenever a new incoming TCP peer connects to this torrent swarm. Called with a
     * peer that has already sent a handshake.
     */
  }, {
    key: "_addIncomingPeer",
    value: function _addIncomingPeer(peer) {
      if (this.destroyed) return peer.destroy(new Error('torrent is destroyed'));
      if (this.paused) return peer.destroy(new Error('torrent is paused'));
      this._debug('add incoming peer %s', peer.id);
      this._registerPeer(peer);
    }
  }, {
    key: "_registerPeer",
    value: function _registerPeer(newPeer) {
      var _this11 = this;
      newPeer.on('download', function (downloaded) {
        if (_this11.destroyed) return;
        _this11.received += downloaded;
        _this11._downloadSpeed(downloaded);
        _this11.client._downloadSpeed(downloaded);
        _this11.emit('download', downloaded);
        if (_this11.destroyed) return;
        _this11.client.emit('download', downloaded);
      });
      newPeer.on('upload', function (uploaded) {
        if (_this11.destroyed) return;
        _this11.uploaded += uploaded;
        _this11._uploadSpeed(uploaded);
        _this11.client._uploadSpeed(uploaded);
        _this11.emit('upload', uploaded);
        if (_this11.destroyed) return;
        _this11.client.emit('upload', uploaded);
      });
      this._peers[newPeer.id] = newPeer;
      this._peersLength += 1;
    }
  }, {
    key: "removePeer",
    value: function removePeer(peer) {
      var _peer, _this$_peers;
      var id = ((_peer = peer) === null || _peer === void 0 ? void 0 : _peer.id) || peer;
      if (peer && !peer.id) peer = (_this$_peers = this._peers) === null || _this$_peers === void 0 ? void 0 : _this$_peers[id];
      if (!peer) return;
      peer.destroy();
      if (this.destroyed) return;
      this._debug('removePeer %s', id);
      delete this._peers[id];
      this._peersLength -= 1;

      // If torrent swarm was at capacity before, try to open a new connection now
      this._drain();
    }
  }, {
    key: "_select",
    value: function _select(start, end, priority, notify) {
      var isStreamSelection = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
      if (this.destroyed) throw new Error('torrent is destroyed');
      if (start < 0 || end < start || this.pieces.length <= end) {
        throw new Error("invalid selection ".concat(start, " : ").concat(end));
      }
      priority = Number(priority) || 0;
      this._debug('select %s-%s (priority %s)', start, end, priority);
      this._selections.insert({
        from: start,
        to: end,
        offset: 0,
        priority: priority,
        notify: notify,
        isStreamSelection: isStreamSelection
      });
      this._selections.sort(function (a, b) {
        return b.priority - a.priority;
      });
      this._updateSelections();
    }
  }, {
    key: "select",
    value: function select(start, end, priority, notify) {
      this._select(start, end, priority, notify, false);
    }
  }, {
    key: "_deselect",
    value: function _deselect(from, to) {
      var isStreamSelection = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      if (this.destroyed) throw new Error('torrent is destroyed');
      this._debug('deselect %s-%s', from, to);
      this._selections.remove({
        from: from,
        to: to,
        isStreamSelection: isStreamSelection
      });
      this._updateSelections();
    }
  }, {
    key: "deselect",
    value: function deselect(start, end) {
      this._deselect(start, end, false);
    }
  }, {
    key: "critical",
    value: function critical(start, end) {
      if (this.destroyed) throw new Error('torrent is destroyed');
      this._debug('critical %s-%s', start, end);
      for (var i = start; i <= end; ++i) {
        this._critical[i] = true;
      }
      this._updateSelections();
    }
  }, {
    key: "_onWire",
    value: function _onWire(wire, addr) {
      var _this12 = this;
      this._debug('got wire %s (%s)', wire._debugId, addr || 'Unknown');
      this.wires.push(wire);
      if (addr) {
        // Sometimes RTCPeerConnection.getStats() doesn't return an ip:port for peers
        var parts = addrToIPPort(addr);
        wire.remoteAddress = parts[0];
        wire.remotePort = parts[1];
      }

      // When peer sends PORT message, add that DHT node to routing table
      if (this.client.dht && this.client.dht.listening) {
        wire.on('port', function (port) {
          if (_this12.destroyed || _this12.client.dht.destroyed) {
            return;
          }
          if (!wire.remoteAddress) {
            return _this12._debug('ignoring PORT from peer with no address');
          }
          if (port === 0 || port > 65536) {
            return _this12._debug('ignoring invalid PORT from peer');
          }
          _this12._debug('port: %s (from %s)', port, addr);
          _this12.client.dht.addNode({
            host: wire.remoteAddress,
            port: port
          });
        });
      }
      wire.on('timeout', function () {
        _this12._debug('wire timeout (%s)', addr);
        // TODO: this might be destroying wires too eagerly
        wire.destroy();
      });

      // Timeout for piece requests to this peer
      if (wire.type !== 'webSeed') {
        // webseeds always send 'unhave' on http timeout
        wire.setTimeout(PIECE_TIMEOUT, true);
      }

      // Send KEEP-ALIVE (every 60s) so peers will not disconnect the wire
      wire.setKeepAlive(true);

      // use ut_metadata extension
      wire.use(utMetadata(this.metadata));
      wire.ut_metadata.on('warning', function (err) {
        _this12._debug('ut_metadata warning: %s', err.message);
      });
      if (!this.metadata) {
        wire.ut_metadata.on('metadata', function (metadata) {
          _this12._debug('got metadata via ut_metadata');
          _this12._onMetadata(metadata);
        });
        wire.ut_metadata.fetch();
      }

      // use ut_pex extension if the torrent is not flagged as private
      if (this.client.utPex && typeof utPex === 'function' && !this["private"]) {
        wire.use(utPex());
        wire.ut_pex.on('peer', function (peer) {
          // Only add potential new peers when we're not seeding
          if (_this12.done) return;
          _this12._debug('ut_pex: got peer: %s (from %s)', peer, addr);
          _this12.addPeer(peer, Peer.SOURCE_UT_PEX);
        });
        wire.ut_pex.on('dropped', function (peer) {
          // the remote peer believes a given peer has been dropped from the torrent swarm.
          // if we're not currently connected to it, then remove it from the queue.
          var peerObj = _this12._peers[peer];
          if (peerObj && !peerObj.connected) {
            _this12._debug('ut_pex: dropped peer: %s (from %s)', peer, addr);
            _this12.removePeer(peer);
          }
        });
        wire.once('close', function () {
          // Stop sending updates to remote peer
          wire.ut_pex.reset();
        });
      }
      wire.use(ltDontHave());

      // Hook to allow user-defined `bittorrent-protocol` extensions
      // More info: https://github.com/webtorrent/bittorrent-protocol#extension-api
      this.emit('wire', wire, addr);
      if (this.ready) {
        queueMicrotask(function () {
          // This allows wire.handshake() to be called (by Peer.onHandshake) before any
          // messages get sent on the wire
          _this12._onWireWithMetadata(wire);
        });
      }
    }
  }, {
    key: "_onWireWithMetadata",
    value: function _onWireWithMetadata(wire) {
      var _this13 = this;
      var timeoutId = null;
      var onChokeTimeout = function onChokeTimeout() {
        if (_this13.destroyed || wire.destroyed) return;
        if (_this13._numQueued > 2 * (_this13._numConns - _this13.numPeers) && wire.amInterested) {
          wire.destroy();
        } else {
          timeoutId = setTimeout(onChokeTimeout, CHOKE_TIMEOUT);
          if (timeoutId.unref) timeoutId.unref();
        }
      };
      var i;
      var updateSeedStatus = function updateSeedStatus() {
        if (wire.peerPieces.buffer.length !== _this13.bitfield.buffer.length) return;
        for (i = 0; i < _this13.pieces.length; ++i) {
          if (!wire.peerPieces.get(i)) return;
        }
        wire.isSeeder = true;
        if (_this13.alwaysChokeSeeders) wire.choke(); // always choke seeders
      };
      wire.on('bitfield', function () {
        updateSeedStatus();
        _this13._update();
        _this13._updateWireInterest(wire);
      });
      wire.on('have', function () {
        updateSeedStatus();
        _this13._update();
        _this13._updateWireInterest(wire);
      });
      wire.lt_donthave.on('donthave', function () {
        updateSeedStatus();
        _this13._update();
        _this13._updateWireInterest(wire);
      });

      // fast extension (BEP6)
      wire.on('have-all', function () {
        wire.isSeeder = true;
        if (_this13.alwaysChokeSeeders) wire.choke(); // always choke seeders
        _this13._update();
        _this13._updateWireInterest(wire);
      });

      // fast extension (BEP6)
      wire.on('have-none', function () {
        wire.isSeeder = false;
        _this13._update();
        _this13._updateWireInterest(wire);
      });

      // fast extension (BEP6)
      wire.on('allowed-fast', function (index) {
        _this13._update();
      });
      wire.once('interested', function () {
        wire.unchoke();
      });
      wire.once('close', function () {
        clearTimeout(timeoutId);
      });
      wire.on('choke', function () {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(onChokeTimeout, CHOKE_TIMEOUT);
        if (timeoutId.unref) timeoutId.unref();
      });
      wire.on('unchoke', function () {
        clearTimeout(timeoutId);
        _this13._update();
      });
      wire.on('request', function (index, offset, length, cb) {
        if (length > MAX_BLOCK_LENGTH) {
          // Per spec, disconnect from peers that request >128KB
          return wire.destroy();
        }
        if (_this13.pieces[index]) return;
        _this13.store.get(index, {
          offset: offset,
          length: length
        }, cb);
      });

      // always send bitfield or equivalent fast extension message (required)
      if (wire.hasFast && this._hasAllPieces()) wire.haveAll();else if (wire.hasFast && this._hasNoPieces()) wire.haveNone();else wire.bitfield(this.bitfield);

      // initialize interest in case bitfield message was already received before above handler was registered
      this._updateWireInterest(wire);

      // Send PORT message to peers that support DHT
      if (wire.peerExtensions.dht && this.client.dht && this.client.dht.listening) {
        wire.port(this.client.dht.address().port);
      }
      if (wire.type !== 'webSeed') {
        // do not choke on webseeds
        timeoutId = setTimeout(onChokeTimeout, CHOKE_TIMEOUT);
        if (timeoutId.unref) timeoutId.unref();
      }
      wire.isSeeder = false;
      updateSeedStatus();
    }

    /**
     * Called on selection changes.
     */
  }, {
    key: "_updateSelections",
    value: function _updateSelections() {
      var _this14 = this;
      if (!this.ready || this.destroyed) return;
      queueMicrotask(function () {
        _this14._gcSelections();
      });
      this._updateInterest();
      this._update();
    }

    /**
     * Garbage collect selections with respect to the store's current state.
     */
  }, {
    key: "_gcSelections",
    value: function _gcSelections() {
      var _iterator = _createForOfIteratorHelper(this._selections),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _s$notify, _s$notify2;
          var s = _step.value;
          var oldOffset = s.offset;

          // check for newly downloaded pieces in selection
          while (this.bitfield.get(s.from + s.offset) && s.from + s.offset < s.to) {
            s.offset += 1;
          }
          if (oldOffset !== s.offset) (_s$notify = s.notify) === null || _s$notify === void 0 || _s$notify.call(s);
          if (s.to !== s.from + s.offset) continue;
          if (!this.bitfield.get(s.from + s.offset)) continue;
          s.remove(); // remove fully downloaded selection
          (_s$notify2 = s.notify) === null || _s$notify2 === void 0 || _s$notify2.call(s);
          this._updateInterest();
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      if (!this._selections.length) this.emit('idle');
    }

    /**
     * Update interested status for all peers.
     */
  }, {
    key: "_updateInterest",
    value: function _updateInterest() {
      var _this15 = this;
      var prev = this._amInterested;
      this._amInterested = !!this._selections.length;
      this.wires.forEach(function (wire) {
        return _this15._updateWireInterest(wire);
      });
      if (prev === this._amInterested) return;
      if (this._amInterested) this.emit('interested');else this.emit('uninterested');
    }
  }, {
    key: "_updateWireInterest",
    value: function _updateWireInterest(wire) {
      var interested = false;
      for (var index = 0; index < this.pieces.length; ++index) {
        if (this.pieces[index] && wire.peerPieces.get(index)) {
          interested = true;
          break;
        }
      }
      if (interested) wire.interested();else wire.uninterested();
    }

    /**
     * Heartbeat to update all peers and their requests.
     */
  }, {
    key: "_update",
    value: function _update() {
      var _this16 = this;
      if (IDLE_CALLBACK) {
        IDLE_CALLBACK(function () {
          return _this16._updateWireWrapper();
        }, {
          timeout: 250
        });
      } else {
        this._updateWireWrapper();
      }
    }
  }, {
    key: "_updateWireWrapper",
    value: function _updateWireWrapper() {
      if (this.destroyed) return;
      // update wires in random order for better request distribution
      var ite = randomIterate(this.wires);
      var wire;
      while (wire = ite()) {
        this._updateWire(wire);
      }
    }

    /**
     * Attempts to update a peer's requests
     */
  }, {
    key: "_updateWire",
    value: function _updateWire(wire) {
      if (wire.destroyed) return false;
      // to allow function hoisting
      var self = this;
      var minOutstandingRequests = getBlockPipelineLength(wire, PIPELINE_MIN_DURATION);
      if (wire.requests.length >= minOutstandingRequests) return;
      var maxOutstandingRequests = getBlockPipelineLength(wire, PIPELINE_MAX_DURATION);
      if (wire.peerChoking) {
        if (wire.hasFast && wire.peerAllowedFastSet.length > 0 && !this._hasMorePieces(wire.peerAllowedFastSet.length - 1)) {
          requestAllowedFastSet();
        }
        return;
      }
      if (!wire.downloaded) return validateWire();
      trySelectWire(false) || trySelectWire(true);
      function requestAllowedFastSet() {
        if (wire.requests.length >= maxOutstandingRequests) return false;
        var _iterator2 = _createForOfIteratorHelper(wire.peerAllowedFastSet),
          _step2;
        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var piece = _step2.value;
            if (wire.peerPieces.get(piece) && !self.bitfield.get(piece)) {
              while (self._request(wire, piece, false) && wire.requests.length < maxOutstandingRequests) {
                // body intentionally empty
                // request all non-reserved blocks in this piece
              }
            }
            if (wire.requests.length < maxOutstandingRequests) continue;
            return true;
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
        return false;
      }
      function genPieceFilterFunc(start, end, tried, rank) {
        return function (i) {
          return i >= start && i <= end && !(i in tried) && wire.peerPieces.get(i) && (!rank || rank(i));
        };
      }

      // TODO: Do we need both validateWire and trySelectWire?
      function validateWire() {
        if (wire.requests.length) return;
        var i = self._selections.length;
        while (i--) {
          var next = self._selections.get(i);
          var piece = void 0;
          if (self.strategy === 'rarest') {
            var start = next.from + next.offset;
            var end = next.to;
            var len = end - start + 1;
            var tried = {};
            var tries = 0;
            var filter = genPieceFilterFunc(start, end, tried);
            while (tries < len) {
              piece = self._rarityMap.getRarestPiece(filter);
              if (piece < 0) break;
              if (self._request(wire, piece, false)) return;
              tried[piece] = true;
              tries += 1;
            }
          } else {
            for (piece = next.to; piece >= next.from + next.offset; --piece) {
              if (!wire.peerPieces.get(piece)) continue;
              if (self._request(wire, piece, false)) return;
            }
          }
        }

        // TODO: wire failed to validate as useful; should we close it?
        // probably not, since 'have' and 'bitfield' messages might be coming
      }
      function speedRanker() {
        var speed = wire.downloadSpeed() || 1;
        if (speed > SPEED_THRESHOLD) return function () {
          return true;
        };
        var secs = Math.max(1, wire.requests.length) * Piece.BLOCK_LENGTH / speed;
        var tries = 10;
        var ptr = 0;
        return function (index) {
          if (!tries || self.bitfield.get(index)) return true;
          var missing = self.pieces[index].missing;
          for (; ptr < self.wires.length; ptr++) {
            var otherWire = self.wires[ptr];
            var otherSpeed = otherWire.downloadSpeed();
            if (otherSpeed < SPEED_THRESHOLD) continue;
            if (otherSpeed <= speed) continue;
            if (!otherWire.peerPieces.get(index)) continue;
            if ((missing -= otherSpeed * secs) > 0) continue;
            tries--;
            return false;
          }
          return true;
        };
      }
      function shufflePriority(i) {
        var last = i;
        for (var j = i; j < self._selections.length && self._selections.get(j).priority; j++) {
          last = j;
        }
        self._selections.swap(i, last);
      }
      function trySelectWire(hotswap) {
        if (wire.requests.length >= maxOutstandingRequests) return true;
        var rank = speedRanker();
        for (var i = 0; i < self._selections.length; i++) {
          var next = self._selections.get(i);
          var piece = void 0;
          if (self.strategy === 'rarest') {
            var start = next.from + next.offset;
            var end = next.to;
            var len = end - start + 1;
            var tried = {};
            var tries = 0;
            var filter = genPieceFilterFunc(start, end, tried, rank);
            while (tries < len) {
              piece = self._rarityMap.getRarestPiece(filter);
              if (piece < 0) break;
              while (self._request(wire, piece, self._critical[piece] || hotswap) && wire.requests.length < maxOutstandingRequests) {
                // body intentionally empty
                // request all non-reserved blocks in this piece
              }
              if (wire.requests.length < maxOutstandingRequests) {
                tried[piece] = true;
                tries++;
                continue;
              }
              if (next.priority) shufflePriority(i);
              return true;
            }
          } else {
            for (piece = next.from + next.offset; piece <= next.to; piece++) {
              if (!wire.peerPieces.get(piece) || !rank(piece)) continue;
              while (self._request(wire, piece, self._critical[piece] || hotswap) && wire.requests.length < maxOutstandingRequests) {
                // body intentionally empty
                // request all non-reserved blocks in piece
              }
              if (wire.requests.length < maxOutstandingRequests) continue;
              if (next.priority) shufflePriority(i);
              return true;
            }
          }
        }
        return false;
      }
    }

    /**
     * Called periodically to update the choked status of all peers, handling optimistic
     * unchoking as described in BEP3.
     */
  }, {
    key: "_rechoke",
    value: function _rechoke() {
      var _this17 = this;
      if (!this.ready) return;

      // wires in increasing order of quality (pop() gives next best peer)
      var wireStack = this.wires.map(function (wire) {
        return {
          wire: wire,
          random: Math.random()
        };
      }) // insert a random seed for randomizing the sort
      .sort(function (objA, objB) {
        var wireA = objA.wire;
        var wireB = objB.wire;

        // prefer peers that send us data faster
        if (wireA.downloadSpeed() !== wireB.downloadSpeed()) {
          return wireA.downloadSpeed() - wireB.downloadSpeed();
        }

        // then prefer peers that can download data from us faster
        if (wireA.uploadSpeed() !== wireB.uploadSpeed()) {
          return wireA.uploadSpeed() - wireB.uploadSpeed();
        }

        // then prefer already unchoked peers (to minimize fibrillation)
        if (wireA.amChoking !== wireB.amChoking) {
          return wireA.amChoking ? -1 : 1; // choking < unchoked
        }

        // otherwise random order
        return objA.random - objB.random;
      }).map(function (obj) {
        return obj.wire;
      }); // return array of wires (remove random seed)

      if (this._rechokeOptimisticTime <= 0) {
        // clear old optimistic peer, so it can be rechoked normally and then replaced
        this._rechokeOptimisticWire = null;
      } else {
        this._rechokeOptimisticTime -= 1;
      }
      var numInterestedUnchoked = 0;
      // leave one rechoke slot open for optimistic unchoking
      while (wireStack.length > 0 && numInterestedUnchoked < this._rechokeNumSlots - 1) {
        var wire = wireStack.pop(); // next best quality peer

        if (wire.isSeeder || wire === this._rechokeOptimisticWire) {
          continue;
        }
        wire.unchoke();

        // only stop unchoking once we fill the slots with interested peers that will actually download
        if (wire.peerInterested) {
          numInterestedUnchoked++;
        }
      }

      // fill optimistic unchoke slot if empty
      if (this._rechokeOptimisticWire === null && this._rechokeNumSlots > 0) {
        // don't optimistically unchoke uninterested peers
        var remaining = wireStack.filter(function (wire) {
          return wire.peerInterested;
        });
        if (remaining.length > 0) {
          // select random remaining (not yet unchoked) peer
          var newOptimisticPeer = remaining[randomInt(remaining.length)];
          newOptimisticPeer.unchoke();
          this._rechokeOptimisticWire = newOptimisticPeer;
          this._rechokeOptimisticTime = RECHOKE_OPTIMISTIC_DURATION;
        }
      }

      // choke the rest
      wireStack.filter(function (wire) {
        return wire !== _this17._rechokeOptimisticWire;
      }) // except the optimistically unchoked peer
      .forEach(function (wire) {
        return wire.choke();
      });
    }

    /**
     * Attempts to cancel a slow block request from another wire such that the
     * given wire may effectively swap out the request for one of its own.
     */
  }, {
    key: "_hotswap",
    value: function _hotswap(wire, index) {
      var speed = wire.downloadSpeed();
      if (speed < Piece.BLOCK_LENGTH) return false;
      if (!this._reservations[index]) return false;
      var r = this._reservations[index];
      if (!r) {
        return false;
      }
      var minSpeed = Infinity;
      var minWire;
      var i;
      for (i = 0; i < r.length; i++) {
        var otherWire = r[i];
        if (!otherWire || otherWire === wire) continue;
        var otherSpeed = otherWire.downloadSpeed();
        if (otherSpeed >= SPEED_THRESHOLD) continue;
        if (2 * otherSpeed > speed || otherSpeed > minSpeed) continue;
        minWire = otherWire;
        minSpeed = otherSpeed;
      }
      if (!minWire) return false;
      for (i = 0; i < r.length; i++) {
        if (r[i] === minWire) r[i] = null;
      }
      for (i = 0; i < minWire.requests.length; i++) {
        var req = minWire.requests[i];
        if (req.piece !== index) continue;
        this.pieces[index].cancel(req.offset / Piece.BLOCK_LENGTH | 0);
      }
      this.emit('hotswap', minWire, wire, index);
      return true;
    }

    /**
     * Attempts to request a block from the given wire.
     */
  }, {
    key: "_request",
    value: function _request(wire, index, hotswap) {
      var self = this;
      var numRequests = wire.requests.length;
      var isWebSeed = wire.type === 'webSeed';
      if (self.bitfield.get(index)) return false;
      var maxOutstandingRequests = isWebSeed ? Math.min(getPiecePipelineLength(wire, PIPELINE_MAX_DURATION, self.pieceLength), self.maxWebConns) : getBlockPipelineLength(wire, PIPELINE_MAX_DURATION);
      if (numRequests >= maxOutstandingRequests) return false;
      // var endGame = (wire.requests.length === 0 && self.store.numMissing < 30)

      var piece = self.pieces[index];
      var reservation = isWebSeed ? piece.reserveRemaining() : piece.reserve();
      if (reservation === -1 && hotswap && self._hotswap(wire, index)) {
        reservation = isWebSeed ? piece.reserveRemaining() : piece.reserve();
      }
      if (reservation === -1) return false;
      var r = self._reservations[index];
      if (!r) r = self._reservations[index] = [];
      var i = r.indexOf(null);
      if (i === -1) i = r.length;
      r[i] = wire;
      var chunkOffset = piece.chunkOffset(reservation);
      var chunkLength = isWebSeed ? piece.chunkLengthRemaining(reservation) : piece.chunkLength(reservation);
      wire.request(index, chunkOffset, chunkLength, /*#__PURE__*/function () {
        var _onChunk = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(err, chunk) {
          var buf, hex;
          return _regeneratorRuntime().wrap(function _callee5$(_context5) {
            while (1) switch (_context5.prev = _context5.next) {
              case 0:
                if (!self.destroyed) {
                  _context5.next = 2;
                  break;
                }
                return _context5.abrupt("return");
              case 2:
                if (self.ready) {
                  _context5.next = 4;
                  break;
                }
                return _context5.abrupt("return", self.once('ready', function () {
                  onChunk(err, chunk);
                }));
              case 4:
                if (r[i] === wire) r[i] = null;
                if (!(piece !== self.pieces[index])) {
                  _context5.next = 7;
                  break;
                }
                return _context5.abrupt("return", onUpdateTick());
              case 7:
                if (!err) {
                  _context5.next = 12;
                  break;
                }
                self._debug('error getting piece %s (offset: %s length: %s) from %s: %s', index, chunkOffset, chunkLength, "".concat(wire.remoteAddress, ":").concat(wire.remotePort), err.message);
                isWebSeed ? piece.cancelRemaining(reservation) : piece.cancel(reservation);
                onUpdateTick();
                return _context5.abrupt("return");
              case 12:
                self._debug('got piece %s (offset: %s length: %s) from %s', index, chunkOffset, chunkLength, "".concat(wire.remoteAddress, ":").concat(wire.remotePort));
                if (piece.set(reservation, chunk, wire)) {
                  _context5.next = 15;
                  break;
                }
                return _context5.abrupt("return", onUpdateTick());
              case 15:
                buf = piece.flush(); // TODO: might need to set self.pieces[index] = null here since sha1 is async
                _context5.next = 18;
                return uint8Util.hash(buf, 'hex');
              case 18:
                hex = _context5.sent;
                if (!self.destroyed) {
                  _context5.next = 21;
                  break;
                }
                return _context5.abrupt("return");
              case 21:
                if (hex === self._hashes[index]) {
                  self._debug('piece verified %s', index);
                  self.store.put(index, buf, function (err) {
                    if (err) {
                      self._destroy(err);
                      return;
                    } else {
                      self.pieces[index] = null;
                      self._markVerified(index);
                      self.wires.forEach(function (wire) {
                        wire.have(index);
                      });
                    }
                    // We also check `self.destroyed` since `torrent.destroy()` could have been
                    // called in the `torrent.on('done')` handler, triggered by `_checkDone()`.
                    if (self._checkDone() && !self.destroyed) self.discovery.complete();
                    onUpdateTick();
                  });
                } else {
                  self.pieces[index] = new Piece(piece.length);
                  self.emit('warning', new Error("Piece ".concat(index, " failed verification")));
                  onUpdateTick();
                }
              case 22:
              case "end":
                return _context5.stop();
            }
          }, _callee5);
        }));
        function onChunk(_x7, _x8) {
          return _onChunk.apply(this, arguments);
        }
        return onChunk;
      }());
      function onUpdateTick() {
        queueMicrotask(function () {
          self._update();
        });
      }
      return true;
    }
  }, {
    key: "_checkDone",
    value: function _checkDone() {
      var _this18 = this;
      if (this.destroyed) return;

      // are any new files done?
      this.files.forEach(function (file) {
        if (file.done) return;
        for (var i = file._startPiece; i <= file._endPiece; ++i) {
          if (!_this18.bitfield.get(i)) return;
        }
        file.done = true;
        file.emit('done');
        _this18._debug("file done: ".concat(file.name));
      });

      // is the torrent done? (if all current selections are satisfied, or there are
      // no selections, then torrent is done)
      var done = true;
      var _iterator3 = _createForOfIteratorHelper(this._selections),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var selection = _step3.value;
          for (var piece = selection.from; piece <= selection.to; piece++) {
            if (!this.bitfield.get(piece)) {
              done = false;
              break;
            }
          }
          if (!done) break;
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      if (!this.done && done) {
        this.done = true;
        this._debug("torrent done: ".concat(this.infoHash));
        this.emit('done');
      } else {
        this.done = false;
      }
      this._gcSelections();
      return done;
    }
  }, {
    key: "load",
    value: function () {
      var _load = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(streams, cb) {
        var _this19 = this;
        return _regeneratorRuntime().wrap(function _callee6$(_context6) {
          while (1) switch (_context6.prev = _context6.next) {
            case 0:
              if (!this.destroyed) {
                _context6.next = 2;
                break;
              }
              throw new Error('torrent is destroyed');
            case 2:
              if (this.ready) {
                _context6.next = 4;
                break;
              }
              return _context6.abrupt("return", this.once('ready', function () {
                _this19.load(streams, cb);
              }));
            case 4:
              if (!Array.isArray(streams)) streams = [streams];
              if (!cb) cb = noop;
              _context6.prev = 6;
              _context6.next = 9;
              return chunkStoreIterator.chunkStoreWrite(this.store, joinIterator(streams), {
                chunkLength: this.pieceLength
              });
            case 9:
              this._markAllVerified();
              this._checkDone();
              cb(null);
              _context6.next = 18;
              break;
            case 14:
              _context6.prev = 14;
              _context6.t0 = _context6["catch"](6);
              cb(_context6.t0);
              return _context6.abrupt("return", _context6.t0);
            case 18:
            case "end":
              return _context6.stop();
          }
        }, _callee6, this, [[6, 14]]);
      }));
      function load(_x9, _x10) {
        return _load.apply(this, arguments);
      }
      return load;
    }()
  }, {
    key: "pause",
    value: function pause() {
      if (this.destroyed) return;
      this._debug('pause');
      this.paused = true;
    }
  }, {
    key: "resume",
    value: function resume() {
      if (this.destroyed) return;
      this._debug('resume');
      this.paused = false;
      this._drain();
    }
  }, {
    key: "_debug",
    value: function _debug() {
      var args = [].slice.call(arguments);
      args[0] = "[".concat(this.client ? this.client._debugId : 'No Client', "] [").concat(this._debugId, "] ").concat(args[0]);
      debug$1.apply(void 0, _toConsumableArray(args));
    }

    /**
     * Pop a peer off the FIFO queue and connect to it. When _drain() gets called,
     * the queue will usually have only one peer in it, except when there are too
     * many peers (over `this.maxConns`) in which case they will just sit in the
     * queue until another connection closes.
     */
  }, {
    key: "_drain",
    value: function _drain() {
      var _this20 = this;
      this._debug('_drain numConns %s maxConns %s', this._numConns, this.client.maxConns);
      if (typeof net.connect !== 'function' || this.destroyed || this.paused || this._numConns >= this.client.maxConns) {
        return;
      }
      this._debug('drain (%s queued, %s/%s peers)', this._numQueued, this.numPeers, this.client.maxConns);
      var peer = this._queue.shift();
      if (!peer) return; // queue could be empty

      this._debug('%s connect attempt to %s', peer.type, peer.addr);
      var parts = addrToIPPort(peer.addr);
      var opts = {
        host: parts[0],
        port: parts[1]
      };
      if (this.client.utp && peer.type === Peer.TYPE_UTP_OUTGOING) {
        peer.conn = utp$1.connect(opts.port, opts.host);
      } else {
        peer.conn = net.connect(opts);
      }
      var conn = peer.conn;
      conn.once('connect', function () {
        if (!_this20.destroyed) peer.onConnect();
      });
      conn.once('error', function (err) {
        peer.destroy(err);
      });
      peer.startConnectTimeout();

      // When connection closes, attempt reconnect after timeout (with exponential backoff)
      conn.on('close', function () {
        if (_this20.destroyed) return;
        if (peer.retries >= RECONNECT_WAIT.length) {
          if (_this20.client.utp) {
            var newPeer = _this20._addPeer(peer.addr, 'tcp', peer.source);
            if (newPeer) newPeer.retries = 0;
          } else {
            _this20._debug('conn %s closed: will not re-add (max %s attempts)', peer.addr, RECONNECT_WAIT.length);
          }
          return;
        }
        var ms = RECONNECT_WAIT[peer.retries];
        _this20._debug('conn %s closed: will re-add to queue in %sms (attempt %s)', peer.addr, ms, peer.retries + 1);
        var reconnectTimeout = setTimeout(function () {
          if (_this20.destroyed) return;
          var host = addrToIPPort(peer.addr)[0];
          var type = _this20.client.utp && _this20._isIPv4(host) ? 'utp' : 'tcp';
          var newPeer = _this20._addPeer(peer.addr, type, peer.source);
          if (newPeer) newPeer.retries = peer.retries + 1;
        }, ms);
        if (reconnectTimeout.unref) reconnectTimeout.unref();
      });
    }

    /**
     * Returns `true` if string is valid IPv4/6 address.
     * @param {string} addr
     * @return {boolean}
     */
  }, {
    key: "_validAddr",
    value: function _validAddr(addr) {
      var parts;
      try {
        parts = addrToIPPort(addr);
      } catch (e) {
        return false;
      }
      var host = parts[0];
      var port = parts[1];
      return port > 0 && port < 65535 && !(host === '127.0.0.1' && port === this.client.torrentPort);
    }

    /**
     * Return `true` if string is a valid IPv4 address.
     * @param {string} addr
     * @return {boolean}
     */
  }, {
    key: "_isIPv4",
    value: function _isIPv4(addr) {
      var IPv4Pattern = /^((?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])[.]){3}(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])$/;
      return IPv4Pattern.test(addr);
    }
  }]);
}(EventEmitter);
function getBlockPipelineLength(wire, duration) {
  var length = 2 + Math.ceil(duration * wire.downloadSpeed() / Piece.BLOCK_LENGTH);

  // Honor reqq (maximum number of outstanding request messages) if specified by peer
  if (wire.peerExtendedHandshake) {
    var reqq = wire.peerExtendedHandshake.reqq;
    if (typeof reqq === 'number' && reqq > 0) {
      length = Math.min(length, reqq);
    }
  }
  return length;
}
function getPiecePipelineLength(wire, duration, pieceLength) {
  return 1 + Math.ceil(duration * wire.downloadSpeed() / pieceLength);
}

/**
 * Returns a random integer in [0,high)
 */
function randomInt(high) {
  return Math.random() * high | 0;
}
function noop() {}

var keepAliveTime = 20000;
var ServerBase = /*#__PURE__*/function () {
  function ServerBase(client) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    _classCallCheck(this, ServerBase);
    this.client = client;
    if (!opts.origin) opts.origin = '*'; // allow all origins by default
    this.opts = opts;
    this.pendingReady = new Set();
  }
  return _createClass(ServerBase, [{
    key: "isOriginAllowed",
    value: function isOriginAllowed(req) {
      // When `origin` option is `false`, deny all cross-origin requests
      if (this.opts.origin === false) return false;

      // The user allowed all origins
      if (this.opts.origin === '*') return true;

      // Allow requests where the 'Origin' header matches the `opts.origin` setting
      return req.headers.origin === this.opts.origin;
    }
  }, {
    key: "onRequest",
    value: function () {
      var _onRequest = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(req, cb) {
        var _this = this;
        var pathname, res, onReady, handleRequest, _res;
        return _regeneratorRuntime().wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              pathname = new URL(req.url, 'http://example.com').pathname;
              pathname = pathname.slice(pathname.indexOf(this.pathname) + this.pathname.length + 1);
              res = {
                headers: {
                  // Prevent browser mime-type sniffing
                  'X-Content-Type-Options': 'nosniff',
                  // Defense-in-depth: Set a strict Content Security Policy to mitigate XSS
                  'Content-Security-Policy': "base-uri 'none'; frame-ancestors 'none'; form-action 'none';"
                }
              }; // Allow cross-origin requests (CORS)
              if (this.isOriginAllowed(req)) {
                res.headers['Access-Control-Allow-Origin'] = this.opts.origin === '*' ? '*' : req.headers.origin;
              }
              if (!(pathname === 'favicon.ico')) {
                _context3.next = 6;
                break;
              }
              return _context3.abrupt("return", cb(ServerBase.serve404Page(res)));
            case 6:
              if (!(req.method === 'OPTIONS')) {
                _context3.next = 12;
                break;
              }
              if (!this.isOriginAllowed(req)) {
                _context3.next = 11;
                break;
              }
              return _context3.abrupt("return", cb(ServerBase.serveOptionsRequest(req, res)));
            case 11:
              return _context3.abrupt("return", cb(ServerBase.serveMethodNotAllowed(res)));
            case 12:
              onReady = /*#__PURE__*/function () {
                var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
                  var res;
                  return _regeneratorRuntime().wrap(function _callee$(_context) {
                    while (1) switch (_context.prev = _context.next) {
                      case 0:
                        _this.pendingReady["delete"](onReady);
                        _context.next = 3;
                        return handleRequest();
                      case 3:
                        res = _context.sent;
                        cb(res);
                      case 5:
                      case "end":
                        return _context.stop();
                    }
                  }, _callee);
                }));
                return function onReady() {
                  return _ref.apply(this, arguments);
                };
              }();
              handleRequest = /*#__PURE__*/function () {
                var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
                  var _pathname$split, _pathname$split2, infoHash, filePath, torrent, file;
                  return _regeneratorRuntime().wrap(function _callee2$(_context2) {
                    while (1) switch (_context2.prev = _context2.next) {
                      case 0:
                        if (!(pathname === '')) {
                          _context2.next = 2;
                          break;
                        }
                        return _context2.abrupt("return", ServerBase.serveIndexPage(res, _this.client.torrents, _this.pathname));
                      case 2:
                        _pathname$split = pathname.split('/'), _pathname$split2 = _toArray(_pathname$split), infoHash = _pathname$split2[0], filePath = _pathname$split2.slice(1);
                        filePath = decodeURI(filePath.join('/'));
                        _context2.next = 6;
                        return _this.client.get(infoHash);
                      case 6:
                        torrent = _context2.sent;
                        if (!(!infoHash || !torrent)) {
                          _context2.next = 9;
                          break;
                        }
                        return _context2.abrupt("return", ServerBase.serve404Page(res));
                      case 9:
                        if (filePath) {
                          _context2.next = 11;
                          break;
                        }
                        return _context2.abrupt("return", ServerBase.serveTorrentPage(torrent, res, _this.pathname));
                      case 11:
                        file = torrent.files.find(function (file) {
                          return file.path.replace(/\\/g, '/') === filePath;
                        });
                        if (file) {
                          _context2.next = 14;
                          break;
                        }
                        return _context2.abrupt("return", ServerBase.serve404Page(res));
                      case 14:
                        return _context2.abrupt("return", ServerBase.serveFile(file, req, res));
                      case 15:
                      case "end":
                        return _context2.stop();
                    }
                  }, _callee2);
                }));
                return function handleRequest() {
                  return _ref2.apply(this, arguments);
                };
              }();
              if (!(req.method === 'GET' || req.method === 'HEAD')) {
                _context3.next = 25;
                break;
              }
              if (!this.client.ready) {
                _context3.next = 22;
                break;
              }
              _context3.next = 18;
              return handleRequest();
            case 18:
              _res = _context3.sent;
              return _context3.abrupt("return", cb(_res));
            case 22:
              this.pendingReady.add(onReady);
              this.client.once('ready', onReady);
              return _context3.abrupt("return");
            case 25:
              return _context3.abrupt("return", cb(ServerBase.serveMethodNotAllowed(res)));
            case 26:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this);
      }));
      function onRequest(_x, _x2) {
        return _onRequest.apply(this, arguments);
      }
      return onRequest;
    }()
  }, {
    key: "close",
    value: function close() {
      var _this2 = this;
      var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
      this.closed = true;
      this.pendingReady.forEach(function (onReady) {
        _this2.client.removeListener('ready', onReady);
      });
      this.pendingReady.clear();
      queueMicrotask(cb);
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
      // Only call `server.close` if user has not called it already
      if (this.closed) queueMicrotask(cb);else this.close(cb);
      this.client = null;
    }
  }], [{
    key: "serveIndexPage",
    value: function serveIndexPage(res, torrents, pathname) {
      var listHtml = torrents.map(function (torrent) {
        return "<li>\n        <a href=\"".concat(escapeHtml(pathname), "/").concat(torrent.infoHash, "\">\n          ").concat(escapeHtml(torrent.name), "\n        </a>\n        (").concat(escapeHtml(torrent.length), " bytes)\n      </li>");
      }).join('<br>');
      res.status = 200;
      res.headers['Content-Type'] = 'text/html';
      res.body = getPageHTML('WebTorrent', "<h1>WebTorrent</h1>\n       <ol>".concat(listHtml, "</ol>"));
      return res;
    }
  }, {
    key: "serveMethodNotAllowed",
    value: function serveMethodNotAllowed(res) {
      res.status = 405;
      res.headers['Content-Type'] = 'text/html';
      res.body = getPageHTML('405 - Method Not Allowed', '<h1>405 - Method Not Allowed</h1>');
      return res;
    }
  }, {
    key: "serve404Page",
    value: function serve404Page(res) {
      res.status = 404;
      res.headers['Content-Type'] = 'text/html';
      res.body = getPageHTML('404 - Not Found', '<h1>404 - Not Found</h1>');
      return res;
    }
  }, {
    key: "serveTorrentPage",
    value: function serveTorrentPage(torrent, res, pathname) {
      var listHtml = torrent.files.map(function (file) {
        return "<li>\n        <a href=\"".concat(escapeHtml(pathname), "/").concat(torrent.infoHash, "/").concat(escapeHtml(file.path), "\">\n          ").concat(escapeHtml(file.path), "\n        </a>\n        (").concat(escapeHtml(file.length), " bytes)\n      </li>");
      }).join('<br>');
      res.status = 200;
      res.headers['Content-Type'] = 'text/html';
      res.body = getPageHTML("".concat(escapeHtml(torrent.name), " - WebTorrent"), "<h1>".concat(escapeHtml(torrent.name), "</h1>\n      <ol>").concat(listHtml, "</ol>"));
      return res;
    }
  }, {
    key: "serveOptionsRequest",
    value: function serveOptionsRequest(req, res) {
      res.status = 204; // no content
      res.headers['Access-Control-Max-Age'] = '600';
      res.headers['Access-Control-Allow-Methods'] = 'GET,HEAD';
      if (req.headers['access-control-request-headers']) {
        res.headers['Access-Control-Allow-Headers'] = req.headers['access-control-request-headers'];
      }
      return res;
    }
  }, {
    key: "serveFile",
    value: function serveFile(file, req, res) {
      res.status = 200;

      // Disable caching as data is local anyways
      res.headers.Expires = '0';
      res.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0';
      // Support range-requests
      res.headers['Accept-Ranges'] = 'bytes';
      res.headers['Content-Type'] = file.type;
      // Support DLNA streaming
      res.headers['transferMode.dlna.org'] = 'Streaming';
      res.headers['contentFeatures.dlna.org'] = 'DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01700000000000000000000000000000';

      // Force the browser to download the file if if it's opened in a new tab
      // Set name of file (for "Save Page As..." dialog)
      if (req.destination === 'document') {
        res.headers['Content-Type'] = 'application/octet-stream';
        res.headers['Content-Disposition'] = "attachment; filename*=UTF-8''".concat(encodeRFC5987(file.name));
        res.body = 'DOWNLOAD';
      } else {
        res.headers['Content-Disposition'] = "inline; filename*=UTF-8''".concat(encodeRFC5987(file.name));
      }

      // `rangeParser` returns an array of ranges, or an error code (number) if
      // there was an error parsing the range.
      var range = rangeParser(file.length, req.headers.range || '');
      if (Array.isArray(range)) {
        res.status = 206; // indicates that range-request was understood

        // no support for multi-range request, just use the first range
        range = range[0];
        res.headers['Content-Range'] = "bytes ".concat(range.start, "-").concat(range.end, "/").concat(file.length);
        res.headers['Content-Length'] = range.end - range.start + 1;
      } else {
        res.statusCode = 200;
        range = null;
        res.headers['Content-Length'] = file.length;
      }
      if (req.method === 'GET') {
        var iterator = file[Symbol.asyncIterator](range);
        var transform = null;
        file.emit('iterator', {
          iterator: iterator,
          req: req,
          file: file
        }, function (target) {
          transform = target;
        });
        var stream = streamx.Readable.from(transform || iterator);
        var pipe = null;
        file.emit('stream', {
          stream: stream,
          req: req,
          file: file
        }, function (target) {
          pipe = pump(stream, target);
        });
        res.body = pipe || stream;
      } else {
        res.body = false;
      }
      return res;
    }
  }]);
}();
var NodeServer = /*#__PURE__*/function (_ServerBase) {
  function NodeServer(client, opts) {
    var _this3;
    _classCallCheck(this, NodeServer);
    _this3 = _callSuper(this, NodeServer, [client, opts]);
    _this3.server = http.createServer();
    _this3._listen = _this3.server.listen;
    _this3.server.listen = _this3.listen.bind(_this3);
    _this3._close = _this3.server.close;
    _this3.server.close = _this3.close.bind(_this3);
    _this3.sockets = new Set();
    _this3.closed = false;
    _this3.pathname = (opts === null || opts === void 0 ? void 0 : opts.pathname) || '/webtorrent';
    return _this3;
  }
  _inherits(NodeServer, _ServerBase);
  return _createClass(NodeServer, [{
    key: "wrapRequest",
    value: function wrapRequest(req, res) {
      // If a 'hostname' string is specified, deny requests with a 'Host'
      // header that does not match the origin of the torrent server to prevent
      // DNS rebinding attacks.
      if (this.opts.hostname && req.headers.host !== "".concat(this.opts.hostname, ":").concat(this.server.address().port)) {
        return req.destroy();
      }
      if (!new URL(req.url, 'http://example.com').pathname.startsWith(this.pathname)) {
        return req.destroy();
      }
      this.onRequest(req, function (_ref3) {
        var status = _ref3.status,
          headers = _ref3.headers,
          body = _ref3.body;
        res.writeHead(status, headers);
        if (!!body._readableState || !!body._writableState) {
          // this is probably a bad way of checking? idk
          pump(body, res);
        } else {
          res.end(body);
        }
      });
    }
  }, {
    key: "onConnection",
    value: function onConnection(socket) {
      var _this4 = this;
      socket.setTimeout(36000000);
      this.sockets.add(socket);
      socket.once('close', function () {
        _this4.sockets["delete"](socket);
      });
    }
  }, {
    key: "address",
    value: function address() {
      return this.server.address();
    }
  }, {
    key: "listen",
    value: function listen() {
      this.closed = false;
      this.server.on('connection', this.onConnection.bind(this));
      this.server.on('request', this.wrapRequest.bind(this));
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      return this._listen.apply(this.server, args);
    }
  }, {
    key: "close",
    value: function close() {
      var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
      this.server.removeAllListeners('connection');
      this.server.removeAllListeners('request');
      this.server.removeAllListeners('listening');
      _get(_getPrototypeOf(NodeServer.prototype), "close", this).call(this);
      this._close.call(this.server, cb);
    }
  }, {
    key: "destroy",
    value: function destroy(cb) {
      this.sockets.forEach(function (socket) {
        socket.destroy();
      });
      _get(_getPrototypeOf(NodeServer.prototype), "destroy", this).call(this, cb);
    }
  }]);
}(ServerBase);
var BrowserServer = /*#__PURE__*/function (_ServerBase2) {
  function BrowserServer(client, opts) {
    var _this5;
    _classCallCheck(this, BrowserServer);
    _this5 = _callSuper(this, BrowserServer, [client, opts]);
    _this5.registration = opts.controller;
    _this5.workerKeepAliveInterval = null;
    _this5.workerPortCount = 0;
    var scope = new URL(opts.controller.scope);
    _this5.pathname = scope.pathname + 'webtorrent';
    _this5._address = {
      port: scope.port,
      family: 'IPv4',
      // might be a bad idea?
      address: scope.hostname
    };
    _this5.boundHandler = _this5.wrapRequest.bind(_this5);
    navigator.serviceWorker.addEventListener('message', _this5.boundHandler);
    // test if browser supports cancelling sw Readable Streams
    fetch("".concat(_this5.pathname, "/cancel/")).then(function (res) {
      res.body.cancel();
    });
    return _this5;
  }
  _inherits(BrowserServer, _ServerBase2);
  return _createClass(BrowserServer, [{
    key: "wrapRequest",
    value: function wrapRequest(event) {
      var _this6 = this;
      var req = event.data;
      if (!(req !== null && req !== void 0 && req.type) === 'webtorrent' || !req.url) return null;
      var _event$ports = _slicedToArray(event.ports, 1),
        port = _event$ports[0];
      this.onRequest(req, function (_ref4) {
        var _body$Symbol$asyncIte;
        var status = _ref4.status,
          headers = _ref4.headers,
          body = _ref4.body;
        var asyncIterator = (_body$Symbol$asyncIte = body[Symbol.asyncIterator]) === null || _body$Symbol$asyncIte === void 0 ? void 0 : _body$Symbol$asyncIte.call(body);
        var cleanup = function cleanup() {
          port.onmessage = null;
          if (body !== null && body !== void 0 && body.destroy) body.destroy();
          _this6.workerPortCount--;
          if (!_this6.workerPortCount) {
            clearInterval(_this6.workerKeepAliveInterval);
            _this6.workerKeepAliveInterval = null;
          }
        };
        port.onmessage = /*#__PURE__*/function () {
          var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(msg) {
            var chunk;
            return _regeneratorRuntime().wrap(function _callee4$(_context4) {
              while (1) switch (_context4.prev = _context4.next) {
                case 0:
                  if (!msg.data) {
                    _context4.next = 14;
                    break;
                  }
                  _context4.prev = 1;
                  _context4.next = 4;
                  return asyncIterator.next();
                case 4:
                  chunk = _context4.sent.value;
                  _context4.next = 9;
                  break;
                case 7:
                  _context4.prev = 7;
                  _context4.t0 = _context4["catch"](1);
                case 9:
                  port.postMessage(chunk);
                  if (!chunk) cleanup();
                  if (!_this6.workerKeepAliveInterval) {
                    _this6.workerKeepAliveInterval = setInterval(function () {
                      return fetch("".concat(_this6.pathname, "/keepalive/"));
                    }, keepAliveTime);
                  }
                  _context4.next = 15;
                  break;
                case 14:
                  cleanup();
                case 15:
                case "end":
                  return _context4.stop();
              }
            }, _callee4, null, [[1, 7]]);
          }));
          return function (_x3) {
            return _ref5.apply(this, arguments);
          };
        }();
        _this6.workerPortCount++;
        port.postMessage({
          status: status,
          headers: headers,
          body: asyncIterator ? 'STREAM' : body
        });
      });
    }

    // for compatibility with node version
  }, {
    key: "listen",
    value: function listen(_, cb) {
      cb();
    }
  }, {
    key: "address",
    value: function address() {
      return this._address;
    }
  }, {
    key: "close",
    value: function close(cb) {
      navigator.serviceWorker.removeEventListener('message', this.boundHandler);
      _get(_getPrototypeOf(BrowserServer.prototype), "close", this).call(this, cb);
    }
  }, {
    key: "destroy",
    value: function destroy(cb) {
      _get(_getPrototypeOf(BrowserServer.prototype), "destroy", this).call(this, cb);
    }
  }]);
}(ServerBase); // NOTE: Arguments must already be HTML-escaped
function getPageHTML(title, pageHtml) {
  return "\n    <!DOCTYPE html>\n    <html lang=\"en\">\n      <head>\n        <meta charset=\"utf-8\">\n        <title>".concat(title, "</title>\n      </head>\n      <body>\n        ").concat(pageHtml, "\n      </body>\n    </html>\n  ");
}

// From https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
function encodeRFC5987(str) {
  return encodeURIComponent(str)
  // Note that although RFC3986 reserves "!", RFC5987 does not,
  // so we do not need to escape it
  .replace(/['()]/g, escape) // i.e., %27 %28 %29
  .replace(/\*/g, '%2A')
  // The following are not required for percent-encoding per RFC5987,
  // so we can allow for a little better readability over the wire: |`^
  .replace(/%(?:7C|60|5E)/g, unescape);
}

var debug = debugFactory('webtorrent');

/**
 * Version number in Azureus-style. Generated from major and minor semver version.
 * For example:
 *   '0.16.1' -> '0016'
 *   '1.2.5' -> '0102'
 */
var VERSION_STR = VERSION.replace(/\d*./g, function (v) {
  return "0".concat(v % 100).slice(-2);
}).slice(0, 4);

/**
 * Version prefix string (used in peer ID). WebTorrent uses the Azureus-style
 * encoding: '-', two characters for client id ('WW'), four ascii digits for version
 * number, '-', followed by random numbers.
 * For example:
 *   '-WW0102-'...
 */
var VERSION_PREFIX = "-WW".concat(VERSION_STR, "-");

/**
 * WebTorrent Client
 * @param {Object=} opts
 */
var WebTorrent = /*#__PURE__*/function (_EventEmitter) {
  function WebTorrent() {
    var _opts$natUpnp, _opts$natPmp, _opts$seedOutgoingCon;
    var _this;
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    _classCallCheck(this, WebTorrent);
    _this = _callSuper(this, WebTorrent);
    if (typeof opts.peerId === 'string') {
      _this.peerId = opts.peerId;
    } else if (ArrayBuffer.isView(opts.peerId)) {
      _this.peerId = uint8Util.arr2hex(opts.peerId);
    } else {
      _this.peerId = uint8Util.arr2hex(uint8Util.text2arr(VERSION_PREFIX + uint8Util.arr2base(uint8Util.randomBytes(9))));
    }
    _this.peerIdBuffer = uint8Util.hex2arr(_this.peerId);
    if (typeof opts.nodeId === 'string') {
      _this.nodeId = opts.nodeId;
    } else if (ArrayBuffer.isView(opts.nodeId)) {
      _this.nodeId = uint8Util.arr2hex(opts.nodeId);
    } else {
      _this.nodeId = uint8Util.arr2hex(uint8Util.randomBytes(20));
    }
    _this.nodeIdBuffer = uint8Util.hex2arr(_this.nodeId);
    _this._debugId = _this.peerId.substring(0, 7);
    _this.destroyed = false;
    _this.listening = false;
    _this.torrentPort = opts.torrentPort || 0;
    _this.dhtPort = opts.dhtPort || 0;
    _this.tracker = opts.tracker !== undefined ? opts.tracker : {};
    _this.lsd = opts.lsd !== false;
    _this.utPex = opts.utPex !== false;
    _this.natUpnp = (_opts$natUpnp = opts.natUpnp) !== null && _opts$natUpnp !== void 0 ? _opts$natUpnp : true;
    _this.natPmp = (_opts$natPmp = opts.natPmp) !== null && _opts$natPmp !== void 0 ? _opts$natPmp : true;
    _this.torrents = [];
    _this.maxConns = Number(opts.maxConns) || 55;
    _this.utp = WebTorrent.UTP_SUPPORT && opts.utp !== false;
    _this.seedOutgoingConnections = (_opts$seedOutgoingCon = opts.seedOutgoingConnections) !== null && _opts$seedOutgoingCon !== void 0 ? _opts$seedOutgoingCon : true;
    _this._downloadLimit = Math.max(typeof opts.downloadLimit === 'number' ? opts.downloadLimit : -1, -1);
    _this._uploadLimit = Math.max(typeof opts.uploadLimit === 'number' ? opts.uploadLimit : -1, -1);
    if ((_this.natUpnp || _this.natPmp) && typeof NatAPI === 'function') {
      _this.natTraversal = new NatAPI({
        enableUPNP: _this.natUpnp,
        enablePMP: _this.natPmp,
        upnpPermanentFallback: opts.natUpnp === 'permanent'
      });
    }
    if (opts.secure === true) {
      Promise.resolve().then(function () { return peer; }).then(function (_ref) {
        var enableSecure = _ref.enableSecure;
        return enableSecure();
      });
    }
    _this._debug('new webtorrent (peerId %s, nodeId %s, port %s)', _this.peerId, _this.nodeId, _this.torrentPort);
    _this.throttleGroups = {
      down: new speedLimiter.ThrottleGroup({
        rate: Math.max(_this._downloadLimit, 0),
        enabled: _this._downloadLimit >= 0
      }),
      up: new speedLimiter.ThrottleGroup({
        rate: Math.max(_this._uploadLimit, 0),
        enabled: _this._uploadLimit >= 0
      })
    };
    if (_this.tracker) {
      if (_typeof(_this.tracker) !== 'object') _this.tracker = {};
      if (globalThis.WRTC && !_this.tracker.wrtc) _this.tracker.wrtc = globalThis.WRTC;
    }
    if (typeof ConnPool === 'function') {
      _this._connPool = new ConnPool(_this);
    } else {
      queueMicrotask(function () {
        _this._onListening();
      });
    }

    // stats
    _this._downloadSpeed = throughput();
    _this._uploadSpeed = throughput();
    if (opts.dht !== false && typeof bittorrentDht.Client === 'function' /* browser exclude */) {
      // use a single DHT instance for all torrents, so the routing table can be reused
      _this.dht = new bittorrentDht.Client(Object.assign({}, {
        nodeId: _this.nodeId
      }, opts.dht));
      _this.dht.once('error', function (err) {
        _this._destroy(err);
      });
      _this.dht.once('listening', function () {
        var address = _this.dht.address();
        if (address) {
          _this.dhtPort = address.port;
          if (_this.natTraversal) {
            _this.natTraversal.map({
              publicPort: _this.dhtPort,
              privatePort: _this.dhtPort,
              protocol: 'udp',
              description: 'WebTorrent DHT'
            })["catch"](function (err) {
              debug('error mapping DHT port via UPnP/PMP: %o', err);
            });
          }
        }
      });

      // Ignore warning when there are > 10 torrents in the client
      _this.dht.setMaxListeners(0);
      _this.dht.listen(_this.dhtPort);
    } else {
      _this.dht = false;
    }

    // Enable or disable BEP19 (Web Seeds). Enabled by default:
    _this.enableWebSeeds = opts.webSeeds !== false;
    var ready = function ready() {
      if (_this.destroyed) return;
      _this.ready = true;
      _this.emit('ready');
    };
    if (typeof loadIPSet === 'function' && opts.blocklist != null) {
      loadIPSet(opts.blocklist, {
        headers: {
          'user-agent': "WebTorrent/".concat(VERSION, " (https://webtorrent.io)")
        }
      }, function (err, ipSet) {
        if (err) return console.error("Failed to load blocklist: ".concat(err.message));
        _this.blocked = ipSet;
        ready();
      });
    } else {
      queueMicrotask(ready);
    }
    return _this;
  }

  /**
   * Creates an http server to serve the contents of this torrent,
   * dynamically fetching the needed torrent pieces to satisfy http requests.
   * Range requests are supported.
   *
   * @param {Object} options
   * @param {String} force
   * @return {BrowserServer||NodeServer}
   */
  _inherits(WebTorrent, _EventEmitter);
  return _createClass(WebTorrent, [{
    key: "createServer",
    value: function createServer(options, force) {
      if (this.destroyed) throw new Error('torrent is destroyed');
      if (this._server) throw new Error('server already created');
      if ((typeof window === 'undefined' || force === 'node') && force !== 'browser') {
        // node implementation
        this._server = new NodeServer(this, options);
        return this._server;
      } else {
        // browser implementation
        if (!((options === null || options === void 0 ? void 0 : options.controller) instanceof ServiceWorkerRegistration)) throw new Error('Invalid worker registration');
        if (options.controller.active.state !== 'activated') throw new Error('Worker isn\'t activated');
        this._server = new BrowserServer(this, options);
        return this._server;
      }
    }
  }, {
    key: "downloadSpeed",
    get: function get() {
      return this._downloadSpeed();
    }
  }, {
    key: "uploadSpeed",
    get: function get() {
      return this._uploadSpeed();
    }
  }, {
    key: "progress",
    get: function get() {
      var torrents = this.torrents.filter(function (torrent) {
        return torrent.progress !== 1;
      });
      var downloaded = torrents.reduce(function (total, torrent) {
        return total + torrent.downloaded;
      }, 0);
      var length = torrents.reduce(function (total, torrent) {
        return total + (torrent.length || 0);
      }, 0) || 1;
      return downloaded / length;
    }
  }, {
    key: "ratio",
    get: function get() {
      var uploaded = this.torrents.reduce(function (total, torrent) {
        return total + torrent.uploaded;
      }, 0);
      var received = this.torrents.reduce(function (total, torrent) {
        return total + torrent.received;
      }, 0) || 1;
      return uploaded / received;
    }

    /**
     * Returns the torrent with the given `torrentId`. Convenience method. Easier than
     * searching through the `client.torrents` array. Returns `null` if no matching torrent
     * found.
     *
     * @param  {string|Buffer|Object|Torrent} torrentId
     * @return {Promise<Torrent|null>}
     */
  }, {
    key: "get",
    value: (function () {
      var _get = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(torrentId) {
        var torrents, parsed, _iterator2, _step2, torrent;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              if (!(torrentId instanceof Torrent)) {
                _context.next = 5;
                break;
              }
              if (!this.torrents.includes(torrentId)) {
                _context.next = 3;
                break;
              }
              return _context.abrupt("return", torrentId);
            case 3:
              _context.next = 35;
              break;
            case 5:
              torrents = this.torrents;
              _context.prev = 6;
              _context.next = 9;
              return parseTorrent(torrentId);
            case 9:
              parsed = _context.sent;
              _context.next = 14;
              break;
            case 12:
              _context.prev = 12;
              _context.t0 = _context["catch"](6);
            case 14:
              if (parsed) {
                _context.next = 16;
                break;
              }
              return _context.abrupt("return", null);
            case 16:
              if (parsed.infoHash) {
                _context.next = 18;
                break;
              }
              throw new Error('Invalid torrent identifier');
            case 18:
              _iterator2 = _createForOfIteratorHelper(torrents);
              _context.prev = 19;
              _iterator2.s();
            case 21:
              if ((_step2 = _iterator2.n()).done) {
                _context.next = 27;
                break;
              }
              torrent = _step2.value;
              if (!(torrent.infoHash === parsed.infoHash)) {
                _context.next = 25;
                break;
              }
              return _context.abrupt("return", torrent);
            case 25:
              _context.next = 21;
              break;
            case 27:
              _context.next = 32;
              break;
            case 29:
              _context.prev = 29;
              _context.t1 = _context["catch"](19);
              _iterator2.e(_context.t1);
            case 32:
              _context.prev = 32;
              _iterator2.f();
              return _context.finish(32);
            case 35:
              return _context.abrupt("return", null);
            case 36:
            case "end":
              return _context.stop();
          }
        }, _callee, this, [[6, 12], [19, 29, 32, 35]]);
      }));
      function get(_x) {
        return _get.apply(this, arguments);
      }
      return get;
    }()
    /**
     * Start downloading a new torrent. Aliased as `client.download`.
     * @param {string|Buffer|Object} torrentId
     * @param {Object} opts torrent-specific options
     * @param {function=} ontorrent called when the torrent is ready (has metadata)
     */
    )
  }, {
    key: "add",
    value: function add(torrentId) {
      var _this2 = this;
      var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var ontorrent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};
      if (this.destroyed) throw new Error('client is destroyed');
      if (typeof opts === 'function') {
        var _ref2 = [{}, opts];
        opts = _ref2[0];
        ontorrent = _ref2[1];
      }
      var onInfoHash = function onInfoHash() {
        if (_this2.destroyed) return;
        var _iterator3 = _createForOfIteratorHelper(_this2.torrents),
          _step3;
        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var t = _step3.value;
            if (t.infoHash === torrent.infoHash && t !== torrent) {
              torrent._destroy(new Error("Cannot add duplicate torrent ".concat(torrent.infoHash)));
              ontorrent(t);
              return;
            }
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }
      };
      var onReady = function onReady() {
        if (_this2.destroyed) return;
        ontorrent(torrent);
        _this2.emit('torrent', torrent);
      };
      function onClose() {
        torrent.removeListener('_infoHash', onInfoHash);
        torrent.removeListener('ready', onReady);
        torrent.removeListener('close', onClose);
      }
      this._debug('add');
      opts = opts ? Object.assign({}, opts) : {};
      var torrent = new Torrent(torrentId, this, opts);
      this.torrents.push(torrent);
      torrent.once('_infoHash', onInfoHash);
      torrent.once('ready', onReady);
      torrent.once('close', onClose);
      this.emit('add', torrent);
      return torrent;
    }

    /**
     * Start seeding a new file/folder.
     * @param  {string|File|FileList|Buffer|Array.<string|File|Buffer>} input
     * @param  {Object=} opts
     * @param  {function=} onseed called when torrent is seeding
     */
  }, {
    key: "seed",
    value: function seed(input, opts, onseed) {
      var _this3 = this;
      if (this.destroyed) throw new Error('client is destroyed');
      if (typeof opts === 'function') {
        var _ref3 = [{}, opts];
        opts = _ref3[0];
        onseed = _ref3[1];
      }
      this._debug('seed');
      opts = opts ? Object.assign({}, opts) : {};

      // no need to verify the hashes we create
      opts.skipVerify = true;
      var isFilePath = typeof input === 'string';

      // When seeding from fs path, initialize store from that path to avoid a copy
      if (isFilePath) opts.path = path.dirname(input);
      if (!opts.createdBy) opts.createdBy = "WebTorrent/".concat(VERSION_STR);
      var onTorrent = function onTorrent(torrent) {
        var tasks = [function (cb) {
          // when a filesystem path is specified or the store is preloaded, files are already in the FS store
          if (isFilePath || opts.preloadedStore) return cb();
          torrent.load(streams, cb);
        }];
        if (_this3.dht) {
          tasks.push(function (cb) {
            torrent.once('dhtAnnounce', cb);
          });
        }
        parallel(tasks, function (err) {
          if (_this3.destroyed) return;
          if (err) return torrent._destroy(err);
          _onseed(torrent);
        });
      };
      var _onseed = function _onseed(torrent) {
        _this3._debug('on seed');
        if (typeof onseed === 'function') onseed(torrent);
        torrent.emit('seed');
        _this3.emit('seed', torrent);
      };
      var torrent = this.add(null, opts, onTorrent);
      var streams;
      if (isFileList(input)) input = Array.from(input);else if (!Array.isArray(input)) input = [input];
      parallel(input.map(function (item) {
        return /*#__PURE__*/function () {
          var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(cb) {
            var chunks, _iteratorAbruptCompletion, _didIteratorError, _iteratorError, _iterator, _step, chunk, buf;
            return _regeneratorRuntime().wrap(function _callee2$(_context2) {
              while (1) switch (_context2.prev = _context2.next) {
                case 0:
                  if (!(!opts.preloadedStore && isReadable(item))) {
                    _context2.next = 41;
                    break;
                  }
                  chunks = [];
                  _context2.prev = 2;
                  _iteratorAbruptCompletion = false;
                  _didIteratorError = false;
                  _context2.prev = 5;
                  _iterator = _asyncIterator(item);
                case 7:
                  _context2.next = 9;
                  return _iterator.next();
                case 9:
                  if (!(_iteratorAbruptCompletion = !(_step = _context2.sent).done)) {
                    _context2.next = 15;
                    break;
                  }
                  chunk = _step.value;
                  chunks.push(chunk);
                case 12:
                  _iteratorAbruptCompletion = false;
                  _context2.next = 7;
                  break;
                case 15:
                  _context2.next = 21;
                  break;
                case 17:
                  _context2.prev = 17;
                  _context2.t0 = _context2["catch"](5);
                  _didIteratorError = true;
                  _iteratorError = _context2.t0;
                case 21:
                  _context2.prev = 21;
                  _context2.prev = 22;
                  if (!(_iteratorAbruptCompletion && _iterator["return"] != null)) {
                    _context2.next = 26;
                    break;
                  }
                  _context2.next = 26;
                  return _iterator["return"]();
                case 26:
                  _context2.prev = 26;
                  if (!_didIteratorError) {
                    _context2.next = 29;
                    break;
                  }
                  throw _iteratorError;
                case 29:
                  return _context2.finish(26);
                case 30:
                  return _context2.finish(21);
                case 31:
                  _context2.next = 36;
                  break;
                case 33:
                  _context2.prev = 33;
                  _context2.t1 = _context2["catch"](2);
                  return _context2.abrupt("return", cb(_context2.t1));
                case 36:
                  buf = uint8Util.concat(chunks);
                  buf.name = item.name;
                  cb(null, buf);
                  _context2.next = 42;
                  break;
                case 41:
                  cb(null, item);
                case 42:
                case "end":
                  return _context2.stop();
              }
            }, _callee2, null, [[2, 33], [5, 17, 21, 31], [22,, 26, 30]]);
          }));
          return function (_x2) {
            return _ref4.apply(this, arguments);
          };
        }();
      }), function (err, input) {
        if (_this3.destroyed) return;
        if (err) return torrent._destroy(err);
        createTorrent.parseInput(input, opts, function (err, files) {
          if (_this3.destroyed) return;
          if (err) return torrent._destroy(err);
          streams = files.map(function (file) {
            return file.getStream;
          });
          createTorrent(input, opts, /*#__PURE__*/function () {
            var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(err, torrentBuf) {
              var existingTorrent;
              return _regeneratorRuntime().wrap(function _callee3$(_context3) {
                while (1) switch (_context3.prev = _context3.next) {
                  case 0:
                    if (!_this3.destroyed) {
                      _context3.next = 2;
                      break;
                    }
                    return _context3.abrupt("return");
                  case 2:
                    if (!err) {
                      _context3.next = 4;
                      break;
                    }
                    return _context3.abrupt("return", torrent._destroy(err));
                  case 4:
                    _context3.next = 6;
                    return _this3.get(torrentBuf);
                  case 6:
                    existingTorrent = _context3.sent;
                    if (existingTorrent) {
                      console.warn('A torrent with the same id is already being seeded');
                      torrent._destroy();
                      if (typeof onseed === 'function') onseed(existingTorrent);
                    } else {
                      torrent._onTorrentId(torrentBuf);
                    }
                  case 8:
                  case "end":
                    return _context3.stop();
                }
              }, _callee3);
            }));
            return function (_x3, _x4) {
              return _ref5.apply(this, arguments);
            };
          }());
        });
      });
      return torrent;
    }

    /**
     * Remove a torrent from the client.
     * @param  {string|Buffer|Torrent}   torrentId
     * @param  {function} cb
     */
  }, {
    key: "remove",
    value: (function () {
      var _remove2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(torrentId, opts, cb) {
        var torrent;
        return _regeneratorRuntime().wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              if (!(typeof opts === 'function')) {
                _context4.next = 2;
                break;
              }
              return _context4.abrupt("return", this.remove(torrentId, null, opts));
            case 2:
              this._debug('remove');
              _context4.next = 5;
              return this.get(torrentId);
            case 5:
              torrent = _context4.sent;
              if (torrent) {
                _context4.next = 8;
                break;
              }
              throw new Error("No torrent with id ".concat(torrentId));
            case 8:
              this._remove(torrent, opts, cb);
            case 9:
            case "end":
              return _context4.stop();
          }
        }, _callee4, this);
      }));
      function remove(_x5, _x6, _x7) {
        return _remove2.apply(this, arguments);
      }
      return remove;
    }())
  }, {
    key: "_remove",
    value: function _remove(torrent, opts, cb) {
      if (!torrent) return;
      if (typeof opts === 'function') return this._remove(torrent, null, opts);
      var index = this.torrents.indexOf(torrent);
      if (index === -1) return;
      this.torrents.splice(index, 1);
      torrent.destroy(opts, cb);
      if (this.dht) {
        this.dht._tables.remove(torrent.infoHash);
      }
      this.emit('remove', torrent);
    }
  }, {
    key: "address",
    value: function address() {
      if (!this.listening) return null;
      return this._connPool ? this._connPool.tcpServer.address() : {
        address: '0.0.0.0',
        family: 'IPv4',
        port: 0
      };
    }

    /**
     * Set global download throttle rate.
     * @param  {Number} rate (must be bigger or equal than zero, or -1 to disable throttling)
     */
  }, {
    key: "throttleDownload",
    value: function throttleDownload(rate) {
      rate = Number(rate);
      if (isNaN(rate) || !isFinite(rate) || rate < -1) return false;
      this._downloadLimit = rate;
      if (this._downloadLimit < 0) return this.throttleGroups.down.setEnabled(false);
      this.throttleGroups.down.setEnabled(true);
      this.throttleGroups.down.setRate(this._downloadLimit);
    }

    /**
     * Set global upload throttle rate
     * @param  {Number} rate (must be bigger or equal than zero, or -1 to disable throttling)
     */
  }, {
    key: "throttleUpload",
    value: function throttleUpload(rate) {
      rate = Number(rate);
      if (isNaN(rate) || !isFinite(rate) || rate < -1) return false;
      this._uploadLimit = rate;
      if (this._uploadLimit < 0) return this.throttleGroups.up.setEnabled(false);
      this.throttleGroups.up.setEnabled(true);
      this.throttleGroups.up.setRate(this._uploadLimit);
    }

    /**
     * Destroy the client, including all torrents and connections to peers.
     * @param  {function} cb
     */
  }, {
    key: "destroy",
    value: function destroy(cb) {
      if (this.destroyed) throw new Error('client already destroyed');
      this._destroy(null, cb);
    }
  }, {
    key: "_destroy",
    value: function _destroy(err, cb) {
      var _this4 = this;
      this._debug('client destroy');
      this.destroyed = true;
      var tasks = this.torrents.map(function (torrent) {
        return function (cb) {
          torrent.destroy(cb);
        };
      });
      if (this._connPool) {
        tasks.push(function (cb) {
          _this4._connPool.destroy(cb);
        });
      }
      if (this.dht) {
        tasks.push(function (cb) {
          _this4.dht.destroy(cb);
        });
      }
      if (this._server) {
        tasks.push(function (cb) {
          _this4._server.destroy(cb);
        });
      }
      if (this.natTraversal) {
        tasks.push(function (cb) {
          _this4.natTraversal.destroy().then(function () {
            return cb();
          });
        });
      }
      parallel(tasks, cb);
      if (err) this.emit('error', err);
      this.torrents = [];
      this._connPool = null;
      this.dht = null;
      this.throttleGroups.down.destroy();
      this.throttleGroups.up.destroy();
    }
  }, {
    key: "_onListening",
    value: function _onListening() {
      this._debug('listening');
      this.listening = true;
      if (this._connPool) {
        // Sometimes server.address() returns `null` in Docker.
        var address = this._connPool.tcpServer.address();
        if (address) {
          this.torrentPort = address.port;
          if (this.natTraversal) {
            this.natTraversal.map({
              publicPort: this.torrentPort,
              privatePort: this.torrentPort,
              protocol: this.utp ? null : 'tcp',
              description: 'WebTorrent Torrent'
            })["catch"](function (err) {
              debug('error mapping WebTorrent port via UPnP/PMP: %o', err);
            });
          }
        }
      }
      this.emit('listening');
    }
  }, {
    key: "_debug",
    value: function _debug() {
      var args = [].slice.call(arguments);
      args[0] = "[".concat(this._debugId, "] ").concat(args[0]);
      debug.apply(void 0, _toConsumableArray(args));
    }
  }, {
    key: "_getByHash",
    value: function () {
      var _getByHash2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(infoHashHash) {
        var _iterator4, _step4, torrent;
        return _regeneratorRuntime().wrap(function _callee5$(_context5) {
          while (1) switch (_context5.prev = _context5.next) {
            case 0:
              _iterator4 = _createForOfIteratorHelper(this.torrents);
              _context5.prev = 1;
              _iterator4.s();
            case 3:
              if ((_step4 = _iterator4.n()).done) {
                _context5.next = 13;
                break;
              }
              torrent = _step4.value;
              if (torrent.infoHashHash) {
                _context5.next = 9;
                break;
              }
              _context5.next = 8;
              return uint8Util.hash(uint8Util.hex2arr('72657132' /* 'req2' */ + torrent.infoHash), 'hex');
            case 8:
              torrent.infoHashHash = _context5.sent;
            case 9:
              if (!(infoHashHash === torrent.infoHashHash)) {
                _context5.next = 11;
                break;
              }
              return _context5.abrupt("return", torrent);
            case 11:
              _context5.next = 3;
              break;
            case 13:
              _context5.next = 18;
              break;
            case 15:
              _context5.prev = 15;
              _context5.t0 = _context5["catch"](1);
              _iterator4.e(_context5.t0);
            case 18:
              _context5.prev = 18;
              _iterator4.f();
              return _context5.finish(18);
            case 21:
              return _context5.abrupt("return", null);
            case 22:
            case "end":
              return _context5.stop();
          }
        }, _callee5, this, [[1, 15, 18, 21]]);
      }));
      function _getByHash(_x8) {
        return _getByHash2.apply(this, arguments);
      }
      return _getByHash;
    }()
  }]);
}(EventEmitter);
WebTorrent.WEBRTC_SUPPORT = Peer$1.WEBRTC_SUPPORT;
WebTorrent.UTP_SUPPORT = ConnPool.UTP_SUPPORT;
WebTorrent.VERSION = VERSION;

/**
 * Check if `obj` is a node Readable stream
 * @param  {*} obj
 * @return {boolean}
 */
function isReadable(obj) {
  return _typeof(obj) === 'object' && obj != null && typeof obj.pipe === 'function';
}

/**
 * Check if `obj` is a W3C `FileList` object
 * @param  {*} obj
 * @return {boolean}
 */
function isFileList(obj) {
  return typeof FileList !== 'undefined' && obj instanceof FileList;
}

module.exports = WebTorrent;
