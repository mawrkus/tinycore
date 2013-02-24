
# TinyCore.js 

`Version 0.3.1`

## Overview

A tiny modular architecture framework in JavaScript.

Inspiration : "Scalable JavaScript Application Architecture", by Nicholas C. Zakas.
- Video : [http://www.youtube.com/watch?v=vXjVFPosQHw](http://www.youtube.com/watch?v=vXjVFPosQHw)
- Slides : [http://www.slideshare.net/nzakas/scalable-javascript-application-architecture-2012](http://www.slideshare.net/nzakas/scalable-javascript-application-architecture-2012)

## Features

- Around 2.5Kb minified
- Extensible
- Supports unit testing of the modules
- Supports async modules loading using AMD and [require.js](http://requirejs.org) (less than 1Kb extension)
- Tested under IE7+, Safari 5.1, Opera 12, Chrome 24 and Firefox 18

## Usage

Include TinyCore.js :

```html
	<script type="text/javascript" src="TinyCore.js"></script> 
```

This will give you access to the global variable `TinyCore`.

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

Furthermore, a module can use the default *mediator* [1] provided by the sandbox to communicate (publish/subscribe topics) with other parts of the application :

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
			oSandBox.subscribe( ['user:connected', 'user:disconnected'], this.processUserActivity, this );
			oSandBox.publish( 'monitoring:start', { timestamp : +new Date } );
		},
		/**
		 * This method will be called when the module is stopped.
		 */
		onStop : function ()
		{
			oSandBox.publish( 'monitoring:stop', { timestamp : +new Date } );
			oSandBox.unSubscribe( 'user:connected', 'user:disconnected'] );
			this.oContainer = null;
		},
		/**
		 * Handles the topics received.
		 * @param {Object} oTopic The topic object
		 * @param {String} oTopic.name The topic name
		 * @param {String} oTopic.data The data associated to the topic
		 */
		processUserActivity : function ( oTopic )
		{
			var sName = oTopic.name,
				oData = oTopic.data;

			switch ( sName )
			{
				case 'user:connected':
					// Do something with the data associated to the topic
					break;

				case 'user:disconnected':
					// Do something with the data associated to the topic
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

An alternative would be to use automatic topics subscription (see TinyCore's extended API extension).

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
	build : function ( sSandBoxType ) {}
};
```

By default, each module will received a sandbox that only implements a simple publish/subscribe system :

```js
var oSandboxPrototype = {
	subscribe : function ( aTopics, fpHandler, oContext ) {},
	publish : function ( sTopic, oData ) {},
	unSubscribe : function ( aTopics ) {},
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

Then, when registering a module, you can specify the sandbox type using the last parameter :

```js
TinyCore.register( 'users_monitoring', function ( oSandBox ) {
	var _oUtils = oSandBox.utils,
		_oDom = oSandBox.dom;

	...
}, 'dom_and_utils' );
```

This will build a new module sandbox with this augmented API :

```js
var oCustomSandbox = {
	// Default sandbox functions.
	subscribe : function ( aTopics, fpHandler, oContext ) {},
	publish : function ( sTopic, oData ) {},
	unSubscribe : function ( aTopics ) {},
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

For instance, some modules could have access to AJAX/DOM functions while others could not, some modules should be able to publish topics while others not. Some modules could use optimized or experimental versions of certain functions, etc.

### C. Core

- Manages modules *lifecycles* : start/stop modules.
- Enables *inter-modules communication* via notifications to the sandbox.
- Handles errors : detect, trap and report errors.

The core API :

```js
var TinyCore = {
	extend : function ( oTinyExtension ) {},
	register : function ( sModuleName, fpCreator ) {},
	start : function ( sModuleName, oStartData, sSandBoxType ) {},
	stop : function ( sModuleName ) {},
	instanciate : function ( sModuleName ) {},
	getModules : function () {},
	SandBox : {
		register : function ( sSandBoxType, oNewSandBox ) {},
		build : function ( sSandBoxType ) {}
	},
	ErrorHandler : {
		log : function ( sMsg ) {}
	}
};
```

The *extend* method is used to add extensions to TinyCore.  
The *instanciate* method returns a module's instance that can be used for unit tests.  
The *getModules* method returns all the modules that have been registered, useful when developing an extension.  
*ErrorHandler.log* is just a wrapper over the console.error function.

## Extensions

### 1. TinyCore's Extended API : around 1.5Kb

`Version 0.2.0`

```js
var TinyCoreExtAPI = {
	instanciate : function ( sModuleName ) {},
	isStarted : function ( sModuleName ) {},
	startAll : function ( aModulesNamesOrStartData, oOptionalStartData ) {},
	stopAll : function ( aModulesNames ) {},
	destroy : function ( sModuleName ) {},
	destroyAll : function ( aModulesNames ) {},
	registerAndStart : function ( sModuleName, fpCreator, sSandBoxType ) {},
	ErrorHandler : {
		log : function ( sMsg ) {}
	}
};
```

The *destroy* method will stop and remove completely a module from TinyCore.  
*ErrorHandler.log* implements a fallback when the console does not exist : the messages are logged in a DOM container.

This extension also redefines the *instanciate* method to allow automatic topics subscriptions, just by adding the *topics* property :

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
			oSandBox.publish( 'monitoring:start', { timestamp : +new Date } );
		},
		/**
		 * This method will be called when the module is stopped.
		 */
		onStop : function ()
		{
			oSandBox.publish( 'monitoring:stop', { timestamp : +new Date } );
			this.oContainer = null;
		},
		/**
		 * The topics and their related handlers.
		 * @type {Object}
		 */
		topics : {
			'user:connected' : function ( oTopic )
			{
				// Do something with the data associated to the topic
			},
			'user:disconnected' : function ( oTopic )
			{
				// Do something with the data associated to the topic
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

In this case, all subscriptions will be made when the module is started and removed when the module is stopped.

### 2. Asynchronous Module Definition : less than 1Kb

`Version 0.1.0`

Modules definition and asynchronous loading via [require.js](http://requirejs.org) [2].  
It is basically a wrapper over *define* and *require* :

```js
var TinyCore.AMD = {
	config : function ( oSettings ) {},
	onError : function ( eError ) {},
	register : function ( aModulesNames, fpCallback ) {},
	registerAndStart : function ( aModulesNames, oModulesStartData, fpCallback ) {}
};
```

The callback parameter of the *register* methods allows you to execute some code when all modules are registered (and started in the case of *registerAndStart*) :

```js
TinyCore.AMD.config( {
	baseUrl : 'modules'
} );

TinyCore.AMD.registerAndStart( ['chart', 'filter'], { 
	'chart' : { type : 'pie', colors : true },
	'filter' : { startDate : new Date() }
}, function ()
{
	console.info( 'Modules loaded and started!', this );
} );
```

An AMD module can be defined like this :

```js
define( ['lib/plot.js'], function ( oPlot )
{
	// We must return the function that will create the module
	return function ( oSandBox )
	{
		return  {
			onStart : function ( oStartData )
			{
				oSandBox.subscribe( ['filter:change', 'filter:reset'], function ( oTopic )
				{
					// Do something with this topic
				} );

				// Let's use the plot library!
				oPlot.init();
				oPlot.draw( oStartData.graphType );
			},
			onStop : function ()
			{
				oSandBox.publish( 'chart:stop');
			}
		};
	};
} );
```

## Creators

- Mawkus aka Marc Mignonsin (<web@sparring-partner.be>)
- JuanMa aka Juan Manuel Garrido (<juanma.garrido@gmail.com>)

## RoadMap

- Add a source map
- Full API documentation
- More demos
- More extensions

[1]: See Addy Osmani's ["Learning JavaScript Design Patterns"](http://addyosmani.com/resources/essentialjsdesignpatterns/book/#mediatorpatternjavascript) book for a good description of this pattern.  
[2]: require.js and AMD : [http://requirejs.org](http://requirejs.org)