
# TinyCore.js

`Version 1.0`

## Overview

A tiny JavaScript modular architecture library.

Main sources of inspiration :

"Scalable JavaScript Application Architecture", by Nicholas C. Zakas.
- Video : [http://www.youtube.com/watch?v=vXjVFPosQHw](http://www.youtube.com/watch?v=vXjVFPosQHw)
- Slides : [http://www.slideshare.net/nzakas/scalable-javascript-application-architecture-2012](http://www.slideshare.net/nzakas/scalable-javascript-application-architecture-2012)

"Patterns For Large-Scale JavaScript Application Architecture", by Addy Osmani.
- [http://addyosmani.com/largescalejavascript](http://addyosmani.com/largescalejavascript)

"The secret to building large apps is never build large apps. Break your applications into small pieces. Then, assemble those testable, bite-sized pieces into your big application" - Justin Meyer, author JavaScriptMVC.

Online demo : [A simple todo list application](http://www.sparring-partner.be/tinycore/demos/todolist/localfiles/index.html)

## Features

- Around 3Kb minified, less than 1Kb gzipped
- Extensible (currently 4 extensions exist)
- Supports unit testing of the modules, with an extension dedicated to the [Jasmine framework](http://pivotal.github.io/jasmine/)
- Supports async modules loading using the [Asynchronous Module Definition](https://github.com/amdjs/amdjs-api/wiki/AMD) format and [require.js](http://requirejs.org)
- Works under IE8+, Safari 5.1, Opera 12, latest Chrome and Firefox

## Benefits

- Decoupled application architecture
- Divide & conquer : each *module* implements only a functionality or a small set of functionalities
- Modules are independent : change/removal/failure of one does not affect the others
- Reusability : modules can be reused across a number of different applications
- Testing : modules can be tested individually both inside and outside of the application

## Usage

Include TinyCore.js :

```html
	<script type="text/javascript" src="TinyCore.js"></script>
```

This will give you access to the global variable `TinyCore` and its components :

- `TinyCore.Module`
- `TinyCore.Toolbox`
- `TinyCore.Utils`
- `TinyCore.Error`

## Description

We do not follow exactly the original idea from Nicholas Zakas. We use [dependency injection](http://en.wikipedia.org/wiki/Dependency_injection) to provide the modules the tools they need to perform their job. Instead of having a single sandbox object with a lot of methods, a module defines explicitly the tools it needs. The [mediator](http://addyosmani.com/largescalejavascript/#mediatorpattern), that provides a way of communication for the modules, is one of the default tools that has already been implemented (located in the "tools/mediator" folder).

Let's cover the following topics :

**A. Modules** : how to define a module, how to manage modules life cycles?

**B. Toolbox** : how to register tools that can help the modules do their job?

**C. Utils** : what is the set of existing utils?

**D. Error and debugMode** : how errors can be reported/logged?

### A. Modules

A web application module is an independent unit of functionality in the page (HTML+CSS+JS) that creates a meaningful user experience.

Key concepts :

- *Loose coupling* : any single module should be able to live on its own. Changes/removal of one module do not affect the others.
- Each module has its own *sandbox* and needs to stay in it. The sandbox provides all the module needs to perform its job. In our case, the sandbox is not a single object. The sandbox is composed of a collection of objects that can be requested by the module, using dependency injection.

The modules are managed by the `TinyCore.Module` object. It can define, starts, stops or retrieve them.

#### TinyCore.Module API

```js
TinyCore.Module.define( moduleName, toolsNames, creatorFunction )
TinyCore.Module.start( moduleName, startData )
TinyCore.Module.stop( moduleName, stopAndDestroy )
TinyCore.Module.instantiate( moduleName )
TinyCore.Module.getInstance( moduleName, instanceName )
TinyCore.Module.getModules()
```

#### Defining a module

A module can be defined for later use like this :

```js
TinyCore.Module.define( 'elevator', [], function ()
{
	return {
		floor : null,
		/**
		 * This (mandatory) function will be called when the module is started.
		 * @param  {Object} oStartData The data passed when starting the module.
		 */
		onStart : function ( oStartData )
		{
			this.floor = oStartData.floor;
		},
		/**
		 * This (optional) function will be called when the module is stopped.
		 */
		onStop : function ()
		{
			// Cleanup (in order to be properly restarted?)
			this.floor = null;
		},
		/**
		 * This (optional) function will be called when the module is destroyed.
		 */
		onDestroy : function ()
		{
			// Complete cleanup!
			delete this.floor;
		},
		getFloor : function ()
		{
			return this.floor;
		}
	};
} );
```

Note that, although it's a best practice to provide all the `onStart`, `onStop` and `onDestroy` methods when defining a module, the only mandatory method you have to implement is `onStart`.

#### Defining a module that uses the Mediator tool

Let's use the previous example :

```js
TinyCore.Module.define( 'elevator', [ 'mediator' ], function ( oMediator )
{
	return {
		floor : null,
		/**
		 * This (mandatory) function will be called when the module is started.
		 * @param  {Object} oStartData The data passed when starting the module.
		 */
		onStart : function ( oStartData )
		{
			this.floor = oStartData.floor;
			// Let's alert some text whenever the "elevator:call" topic is published.
			oMediator.subscribe( 'elevator:call', function ( oTopic )
			{
				alert( 'Elevator called from floor '+oTopic.data.callFloor );
			} );
		},
		/**
		 * This (optional) function will be called when the module is stopped.
		 */
		onStop : function ()
		{
			// Cleanup (in order to be properly restarted?)
			oMediator.unsubscribeAll();
			this.floor = null;
		},
		/**
		 * This (optional) function will be called when the module is destroyed.
		 */
		onDestroy : function ()
		{
			// Complete cleanup!
			delete this.floor;
		},
		getFloor : function ()
		{
			return this.floor;
		}
	};
} );
```

In this example, the Mediator tool has been requested by adding the `'mediator'` string to the 2nd parameter of `TinyCore.Module.define`.

The Mediator tool registration can be done by including the "tools/mediator/TinyCore.Toolbox.Mediator.js" file.

See "B. Toolbox" for more information.

#### Starting/stopping a module

```js
TinyCore.Module.start( 'elevator', { currentFloor : 2 } );
TinyCore.Module.stop( 'elevator' );
TinyCore.Module.start( 'elevator', { currentFloor : -1 } ); // restart
```

#### Destroying a module

When a module is no more needed in the application, you can destroy it by passing ```true``` as the 2nd parameter of  ```TinyCore.Module.stop``` :

```js
TinyCore.Module.stop( 'elevator', true );
```

It will be stopped and its definition will be removed from TinyCore. Both the ```onStop``` and the ```onDestroy``` methods will be called in the process.

#### Instantiating/testing a module

When starting a module for the first time, a new instance is created internally through the `instantiate` method. This method can also be used to test the module's behaviour. For example, using Jasmine's expectation syntax :

```js
var oElevator = TinyCore.module.instantiate( 'elevator' ),
	nCurrentFloor = oElevator.getCurrentFloor();

expect( nCurrentFloor ).toBeNull(); // true

oElevator.onStart( { floor : 3 } );

expect( oElevator.floor ).toBe( 3 ); // true

```

When setting ```TinyCore.debugMode``` to ```true```, each module instantiated will have a special property named ```__tools__```, which will be populated with the references to all the tools requested.

```js
TinyCore.debugMode = true;

var oElevator = TinyCore.module.instantiate( 'elevator' );

// "toBeObject" is an additional matcher defined in "test/TinyCore.SpecHelper.js"
expect( oElevator.__tools__ ).toBeObject(); // true
expect( oElevator.__tools__.mediator ).toBeObject(); // true

spyOn( oElevator.__tools__.mediator, 'publish' );

oElevator.onStart( { floor : 0 } );

expect( oElevator.__tools__.mediator.subscribe ).toHaveBeenCalled(); // true

```

An extension has been developed to automatically spy on the tools methods. See the "extensions/Jasmine" folder for more information (but read the next chapter first).

### B. Toolbox

In order to provide the modules the tools they need to perform their job, TinyCore uses a *tools factory*, `TinyCore.Toolbox`.

A tool can be registered at any time for later use. Whenever a module is instantiated, the tools specified in the module definition will be requested and injected as parameters of the creator function.

#### TinyCore.Toolbox API

```js
TinyCore.Toolbox.register( toolName, creatorFunction )
TinyCore.Toolbox.request( toolName )
```

Any tool that has already been registered can be requested by the module :

**phone_tools.js :**
```js
TinyCore.Toolbox.register( 'camera', function ()
{
	return { takePhoto : function () {} };
} );
TinyCore.Toolbox.register( 'gps', function ()
{
	return { getActualLocation : function () {} };
} );
TinyCore.Toolbox.register( 'mp3', function ()
{
	return { play : function () {} };
} );
```

**phone_module.js :**
```js
TinyCore.Module.define( 'phone', ['camera','gps','mp3'], function ( camera, gps, mp3 )
{
	return {
		onStart : function ()
		{
			camera.takePhoto();
			gps.getActualLocation();
			mp3.play();
			// sensor is null
		}
	};
} );
```

Note : if a tool that has not been registered is requested, `null` will passed as the corresponding parameter of the creator function.

### C. Utils

TinyCore comes with a set of built-in utilities functions that are used internally.

#### TinyCore.Utils API

```js
TinyCore.Utils.extend( obj1, obj2 /*, ... */ )
TinyCore.Utils.forEach( obj, callback )
TinyCore.Utils.isClass( mixed, sClassName )
TinyCore.Utils.isArray( mixed )
TinyCore.Utils.isFunction( mixed )
TinyCore.Utils.isObject( mixed )
TinyCore.Utils.tryCatchDecorator( context, func, errMsg )
TinyCore.Utils.createModuleObject( creator, args )
```

### D. Error and debugMode

`TinyCore.Error` is the core error handler.

The `TinyCore.debugMode` property defines how errors are reported.

#### TinyCore.Error API

```js
TinyCore.Error.log()
TinyCore.Error.report()
TinyCore.debugMode = false
```

By default, all the methods of a module will be *decorated* by wrapping them into a "try-catch" statement. Should any error occur, it will be caught and logged by `TinyCore.Error.log`, which is just a wrapper over the `console.error` function.

If you do not want this decoration feature, set `TinyCore.debugMode` to `true`. It may be preferable when developing your application. Set it back to `false` in production.

The `report` method throws an exception when `TinyCore.debugMode` is `true`, or calls `TinyCore.Error.log` otherwise.

Feel free to extend/redefine those methods according to your needs.
