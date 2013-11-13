## TinyCore.js / Extensions

### Module inheritance

#### Features

- Extends TinyCore's API with a new method : `TinyCore.Module.inherit`, that allows to reuse an existing module definition.
- Works internally using [John Resig's Simple JavaScript Inheritance](http://ejohn.org/blog/simple-javascript-inheritance/) (prototypal inheritance/mixin).
- Access to overriden methods is provided.
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
TinyCore.Module.inherit( superModuleName, moduleName, toolsNames, creatorFunction )
```

#### Example

Let's define a base "person" module :

```js
TinyCore.Module.define( 'person', [], function ()
{
	return {
		name : '',
		isLiving : null,
		onStart : function ( oStartData )
		{
			this.name = oStartData.name;
			this.isLiving = true;
		},
		onStop : function ()
		{
		},
		onDestroy : function ()
		{
		}
	};
} );
```

We can inherit from this module and create a "warrior" module :

```js
TinyCore.Module.inherit( 'person', 'warrior', [], function ()
{
	return {
		isFighting : null,
		onStart : function ( oStartData )
		{
			this._super( oStartData );
			this.isFighting = true;
		},
		onStop : function ()
		{
			this.isFighting = false;
			this._super();
		},
		onDestroy : function ()
		{
			this._super();
		}
	};
} );
```

Note that the "warrior" module has access to all the properties of the "person" module (`name`, `isLiving`).
Also, the access to the overriden methods is provided via the `_super` function.

Let's finally define a "samurai" module, inheriting from the "warrior" module :

```js
TinyCore.Module.inherit( 'warrior', 'samurai', [], function ()
{
	return {
		followsBushido : null,
		onStart : function ( oStartData )
		{
			this._super( oStartData );
			this.followsBushido = true;
		},
		onStop : function ()
		{
			this.followsBushido = false;
			this._super();
		},
		onDestroy : function ()
		{
			this._super();
		}
	};
} );
```

This final module can then be started/stopped/destroyed as usual :

```js
TinyCore.Module.start( 'samurai', { name : 'Takeda Shingen' } );

TinyCore.Module.stop( 'samurai', true );
```
