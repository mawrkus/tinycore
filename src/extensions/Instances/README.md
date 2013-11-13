## TinyCore.js / Extensions

### Multiple module instances

#### Features

- Extends TinyCore's API with 2 new methods : `TinyCore.Module.startInstance` and `TinyCore.Module.stopInstance`. These methods can be used to start/stop multiple instances of the same module.
- Can be combined with the "Inheritance" extension (see the "extensions/Inheritance" folder)
- Less than 1Kb minified.

#### Extended TinyCore.Module API

```js
// existing
TinyCore.Module.define( moduleName, toolsNames, creatorFunction )
TinyCore.Module.start( moduleName, startData )
TinyCore.Module.stop( moduleName, stopAndDestroy )
TinyCore.Module.instantiate( moduleName )
TinyCore.Module.getInstance( moduleName, instanceName )
TinyCore.Module.getModules()

// extended
TinyCore.Module.startInstance( moduleName, instanceName, startData )
TinyCore.Module.stopInstance( moduleName, instanceName, stopAndDestroy )
```

#### Example

If we define an "elevator" module :

```js
TinyCore.Module.define( 'elevator', [], function ()
{
	return {
		floor : null,
		/**
		 * This (mandatory) function will be called when an instance is started.
		 * @param  {Object} oStartData The data passed when starting the instance.
		 */
		onStart : function ( oStartData )
		{
			this.floor = oStartData.floor;
		},
		/**
		 * This (optional) function will be called when an instance is stopped.
		 */
		onStop : function ()
		{
			// Cleanup (in order to be properly restarted?)
			this.floor = null;
		},
		/**
		 * This (optional) function will be called when an instance is destroyed.
		 */
		onDestroy : function ()
		{
			// Complete cleanup!
			delete this.floor;
		}
	};
} );
```

We can then start/stop 3 of them :

```js
TinyCore.Module.startInstance( 'elevator', 'left-elevator', { currentFloor : +1 } );
TinyCore.Module.startInstance( 'elevator', 'center-elevator', { currentFloor : 0 } );
TinyCore.Module.startInstance( 'elevator', 'right-elevator', { currentFloor : -1 } );

TinyCore.Module.stopInstance( 'elevator', 'left-elevator' );
TinyCore.Module.stopInstance( 'elevator', 'right-elevator' );
TinyCore.Module.stopInstance( 'elevator', 'center-elevator', true ); // and destroy it

// restart
TinyCore.Module.startInstance( 'elevator', 'left-elevator', { currentFloor : 0 } );
```
