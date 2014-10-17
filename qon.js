/*!
 * qon.js
 *
 * qon.js is a tiny dependency injection library that has angularjs flavor but a requirejs-like syntax.
 *
 * @version 1.0.0
 * @author Hiroyuki OHARA <Hiroyuki.no22@gmail.com>
 * @copyright (c) 2014 Hiroyuki OHARA
 * @see https://github.com/no22/qon
 * @license MIT
 */
(function(root, globalName, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof exports === "object") {
    module.exports = factory();
  } else {
    root[globalName] = factory();
  }
})(this, "qon", function() {
  "use strict";
  var SPACES = /\s+/mg, COMMENTS = /(?:\/\*[\s\S]*?\*\/|\/\/.*$)/mg,
    FNARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
  function Container(parent) {
    this.factories = {};
    this.modules = {};
    this.parent = parent || {};
    this.prefix = "$_";
  };
  function startsWith(str, prefix) {
    return str.length > prefix.length && str.slice(0, prefix.length) === prefix ;
  }
  function di(parent) {
    return new Container(parent);
  }
  var methods = {
    module: function(name, deps, factory) {
      if (!factory) {
        factory = deps;
        var dependency = factory.toString().match(FNARGS)[1].replace(COMMENTS,"").replace(SPACES,"");
        deps = dependency === '' ? [] : dependency.split(',');
      }
      this.factories[name] = { deps: deps, factory: factory };
      if (this.modules.hasOwnProperty(name)) delete this.modules[name];
      return this;
    },
    _resolve: function(deps, factory) {
      var args = [], len = deps.length, i;
      for(i = 0; i < len; i++) args[i] = this.resolve(deps[i]);
      return factory.apply(this, args);
    },
    _promise: function(name, mods, fa) {
      var self = this, isCached = false, cached;
      return function() {
        if (isCached) return cached;
        cached = mods[name] = self._resolve(fa.deps, fa.factory);
        isCached = true;
        return cached;
      };
    },
    resolve: function(name) {
      var mods = this.modules, facs = this.factories, parent = this.parent, fa, r, orgName = false, prefix = this.prefix;
      if (startsWith(name, prefix)) orgName = name.slice(prefix.length);
      if (mods.hasOwnProperty(name)) {
        r = mods[name];
      } else if (orgName && facs.hasOwnProperty(orgName)) {
        r = mods[name] = this._promise(orgName, mods, facs[orgName]);
      } else if (facs.hasOwnProperty(name)) {
        fa = facs[name];
        r = mods[name] = this._resolve(fa.deps, fa.factory);
      } else if (parent instanceof this.constructor) {
        r = parent.resolve(name);
      } else if (parent && typeof parent === "object" && parent.hasOwnProperty(name)) {
        r = parent[name];
      } else {
        throw "Error: can't resolve module '" + name + "'";
      }
      return r;
    },
    inject: function(name, deps) {
      if (deps) {
        this.factories[name].deps = deps;
      } else {
        for (var k in name) this.factories[k].deps = name[k];
      }
      return this;
    },
    run: function(deps, func) {
      if (arguments.length === 1) return this.resolve(deps);
      return this._resolve(deps, func);
    },
    di: function(parent) {
      return di(parent || this);
    }
  };
  Container._super_ = null;
  Container.prototype = Object.create(null, {
    constructor: {value: Container, enumerable: false, writable: true, configurable: true }
  });
  for (var k in methods) {
    Container.prototype[k] = methods[k];
  }
  return { Container: Container, di: di };
});
