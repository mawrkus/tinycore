
# TinyCore.js

## Overview

A tiny modular architecture framework in JavaScript.

Inspiration : "Scalable JavaScript Application Architecture", by Nicholas C. Zakas.
- Video : [http://www.youtube.com/watch?v=vXjVFPosQHw](http://www.youtube.com/watch?v=vXjVFPosQHw)
- Slides : [http://www.slideshare.net/nzakas/scalable-javascript-application-architecture-2012](http://www.slideshare.net/nzakas/scalable-javascript-application-architecture-2012)

## Features

- Around 2Kb minified
- Extensible
- Supports unit testing of the modules
- Supports async modules loading using AMD and [require.js](http://requirejs.org) (less than 1Kb extension)

## Description

The framework is composed of :

A. Modules  
B. Sandbox factory  
C. Application core

We do not follow exactly the original idea from Nicholas Zakas : the functionalities provided by the base library will be passed directly to the module sandbox.
The choice is yours, but it is strongly recommended to create an adapter to that library, in order to keep all parts of your application loosely-coupled.

### A. Modules

A web application module is an independent unit of functionality in the page (HTML+CSS+JS) that creates a meaningful user experience.

Key concepts :

- *Loose coupling* : any single module should be able to live on its own. Changes/removal of one module do not affect the others.
- Each module has its own *sandbox* and needs to stay in it. The sandbox provides all the module needs to perform its job.

#### Registering a module

A module can be registered for later use like this :

```js
TinyCore.register( 'users_monitoring', function ( oSandBox )
{
	return {
		/**
		 * This method will be called when the module is started.
		 * @param {Object} oStartData Data passed to this module when started
		 */
		onStart : function ( oStartData )
		{
			// Do something when the module is started.
		},
		/**
		 * This method will be called when the module is stopped.
		 */
		onStop : function ()
		{
			// Cleanup!
		}
	};
} );
```

Note that, although it's a best practice to add both *onStart* and *onStop* methods when registering a module, the only mandatory method you have to implement is *onStart*.

Furthermore, a module can use the default *bus events system* provided by the sandbox to communicate with other parts of the application :

```js
TinyCore.register( 'users_monitoring', function ( oSandBox )
{
	return {
		/**
		 * This method will be called when the module is started.
		 * @param {Object} oStartData Data passed to this module when started
		 */
		onStart : function ( oStartData )
		{
			this.oContainer = document.getElementById( oStartData.containerID );
			oSandBox.subscribe( 'user:connected', this.processUserEvents );
		},
		/**
		 * This method will be called when the module is stopped.
		 */
		onStop : function ()
		{
			oSandBox.unSubscribe( 'user:connected' );
			this.oContainer = null;
			oSandBox.publish( 'monitoring:stop' );
		},
		/**
		 * Handles the events received via the sandbox attached to this module.
		 * @param {Object} oEvent The event object
		 */
		processUserEvents : function ( oEvent )
		{
			var sType = oEvent.type,
				oData = oEvent.data;

			switch ( sType )
			{
				case 'user:connected':
					// Do something with oData
					break;

				default:
					break;
			}
		},
		/**
		 * The container element used to display user activity.
		 * @type {DOM Element}
		 */
		oContainer : null
	};
} );
```

#### Starting a module

```js
TinyCore.start( 'users_monitoring', { containerID : 'users_info_box' } );
```

#### Stopping a module

```js
TinyCore.stop( 'users_monitoring' );
```

### B. Sandbox

The sandbox provides : 

- *Consistency* : ensures a consistent and dependable interface to the modules.		
- *Security* : determines which part of the framework the module can access.
- *Communication* : translates module requests into core actions.

TinyCore uses a *sandbox factory*, allowing the registration and creation of custom sandboxes.

The sandbox factory API has only two methods :

```js
TinyCore.SandBox = {
	register : function ( sSandBoxType, oNewSandBox ) {},
	create : function ( sSandBoxType ) {}
};
```

The default sandbox that will be created and passed to each module implements a very simple bus events system :

```js
var oSandboxPrototype = {
	subscribe : function ( aEventsTypes, fpHandler ) {},
	publish : function ( sEventType, oData ) {},
	unSubscribe : function ( aEventsTypes ) {},
	unSubscribeAll : function () {}
};
```

Using the factory's register method, you can create new types of sandboxes based on this prototype.

#### Registering a new type of sandbox

```js
TinyCore.SandBox.register( 'dom_and_utils', {
	utils : {
		proxy : function ( func, context ) } {}
	},
	dom : {
		append : function ( element, html ) {}
	}
} );
```

When registering a module, you can specify this new type using the last parameter :

```js
TinyCore.register( 'users_monitoring', function ( oSandBox ) {
	var _oUtils = oSandBox.utils,
		_oDom = oSandBox.dom;

	...
}, 'dom_and_utils' );
```

This will create a new module sandbox  with this augmented API :

```js
var oCustomSandbox = {
	// Default sandbox functions.
	subscribe : function ( aEventsTypes, fpHandler ) {},
	publish : function ( sEventType, oData ) {},
	unSubscribe : function ( aEventsTypes ) {},
	unSubscribeAll : function () {},
	// Custom functions.
	utils : {
		proxy : function ( func, context ) } {}
	},
	dom : {
		append : function ( element, html ) {}
	}
};
```

The benefit of this approach is to be able to decide which set of functionalities each module can have access to.

For instance, some modules could have access to AJAX/DOM functions while others could not, some modules should be able to publish events while others not. Some modules could use optimized versions of certain functions, etc.

### C. Core

- Manages modules *lifecycles* : start/stop modules.
- Enables *inter-modules communication* via notifications to the sandbox.
- Handles errors : detect, trap and report.

The core API :

```js
var TinyCore = {
	extend : function ( oTinyExtension ) {},
	register : function ( sModuleID, fpCreator ) {},
	start : function ( sModuleID, oStartData, sSandBoxType ) {},
	stop : function ( sModuleID ) {},
	instanciate : function ( sModuleName ) {},
	getModules : function () {},
	SandBox : {
		register : function ( sSandBoxType, oNewSandBox ) {},
		create : function ( sSandBoxType ) {}
	},
	ErrorHandler : {
		log : function ( sMsg ) {}
	}
};
```

The *extend* method is used to add extensions to TinyCore.  
The *instanciate* method returns a module's instance that can be used for unit tests.  
The *getModules* method returns all the modules that have been registered.  
*ErrorHandler.log* is just a wrapper over the console.error function.

## Extensions

- TinyCore's Extended API (*isStarted, startAll, stopAll, destroy, destroyAll, registerAndStart*)
- AMD modules definition and loading via [require.js](http://requirejs.org)

## Creators

- Mawkus aka Marc Mignonsin (<web@sparring-partner.be>)
- JuanMa aka Juan Manuel Garrido (<juanma.garrido@gmail.com>)

## RoadMap

- Full API documentation
- More demos
- More extensions