qon.js
======================================================================

Qon.js is a tiny dependency injection library (ES5 required) that has angularjs
 flavor but a requirejs-like syntax.

Usage
----------------------------------------------------------------------

### Create Container:

```javascript
// Create DI container.
var container = qon.di();

// create DI container with parent object.
// when a module is not found in a container, it searches from the parent object.
var parent_object = {foo: "Foo"};
var container = qon.di(parent_object);

// create DI container with parent container.
// when a module is not found in a child container, it searches from the parent container.
var parent = qon.di();
var child = qon.di(parent);
// or use parent container instance method "di".
var child = parent.di();

```

### Define Module:

```javascript
// create container
var app = qon.di({$: jQuery});

// define module with implicit dependency injection.
// useful for prototyping, and demo applications.
app.module('Foo', function($) {
  // jQuery was injected as $.
  // this is a factory function,
  // it needs to return the object registered as a module.
  return "Foo";
});

// define module with inline explicit dependency injection.
// this method will work well with JavaScript minifiers/obfuscators.
app.module('Bar', ['Foo'], function(foo) {
  // module Foo was injected as foo
  return "Bar";
});

// minifiers/obfuscators rename the function parameter names.
// the module with implicit dependency injection will not work.
app.module('Baz', function(j, f, b){
  // original source code:
  // app.module('Baz', function($, Foo, Bar){
});

// however, by adding annotation of explicit dependency injection,
// the module will work well.
app.inject('Baz', ['$', 'Foo', 'Bar']);

```

### Resolve Dependency of Module:

All modules created by qon.js container are singleton.
If you need multiple instances, you should register constructor or factory function.

```javascript
// resolve dependency by module name.
// it only tries to resolve the dependency for this module.
var Baz = app.resolve('Baz');

// execute bootstrapping code with modules.
app.run(['Foo', 'Bar'], function(Foo, Bar){
  // bootstrapping
});
```

### Lazy Dependency Resolution:

Qon.js container resolves dependency by on-demand when resolve() method is invoked.
Although qon.js resolves dependency passively, it is **eager** resolution.
Dependency must be resolved **before** the factory function of the module is executed.
This means that it is necessary to resolve the graph of all the dependency related at the time of initialization.
This causes a problem, when the large project applied, or when cyclical dependency exists.

Qon.js has the mechanism for lazy resolution of specific dependency.

When a module name of dependency annotation has a special prefix,  The factory function which had resolution of the dependency of the module postponed is injected instead of the module by which the dependency was resolved.

```javascript
// define module Foo.
app.module('Foo', ['BigModule1', 'BigModule2'], function(m1, m2) {
  // ...
});

// define module Bar.
app.module('Bar', ['$_Foo'], function(postponedFooFactory) {
  // dependency resolution of Foo is postponed
  // until execution of injected postponedFooFactory.
  return function() {
    var Foo = postponedFooFactory();
    // Even when postponedFooFactory executed many times,
    // resolution of dependency is executed only once.
  };
});

```

License
----------------------------------------------------------------------

Copyright (c) 2014 Hiroyuki OHARA Licensed under the MIT license.
