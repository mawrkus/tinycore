## TinyCore.js / Extensions

### Jasmine testing, fake tools

#### Features

- This extension works with the [Jasmine framework](http://pivotal.github.io/jasmine/). It decorates the original `TinyCore.Toolbox.request` method, so that, whenever a module tool is requested, all its methods are automatically stubbed using the Jasmine's `spyOn` function. The same "fake" tool will always be returned each time `TinyCore.Toolbox.request` is called.
- Less than 500 bytes minified.

#### Example

We register 2 tools, `dom` and `db` :

```js
TinyCore.Toolbox.register( 'dom', function ()
{
	var doc = window.document;

	return {
		byClass : function ( sClass )
		{
			return doc.querySelectorAll( '.'+sClass );
		},
		byTagName : function ( sTagName )
		{
			return doc.getElementsByTagName( sTagName );
		}
	};
} );

TinyCore.Toolbox.register( 'db', function ()
{
	return {
		find : function ( oQuery ) { return {}; }
	};
} );
```

We define the "user" module, that uses both tools :

```js
TinyCore.Module.define( 'user', [ 'dom', 'db' ], function ( DOM, DB )
{
	return {
		onStart : function ( oStartData )
		{
			var userData = DB.find( { user : oStartData.user } ),
				container = DOM.byClass( '.current-user' );
		}
	};
} );
```

In our Jasmine tests, all the methods are already stubbed, allowing us to focus only on verifying the expectations :

```js
describe( 'TinyCore.Toolbox.request', function ()
{
	it( 'should provide unique tools, with all methods stubbed, to the creator function of the module', function ()
	{
		var oUserModule = TinyCore.Module.instantiate( 'user' ),
			DB = TinyCore.Toolbox.request( 'db' ),
			DOM = TinyCore.Toolbox.request( 'dom' ),
			oStartData = { user : 'blake' };

		oUserModule.onStart( oStartData );

		expect( DB.find.calls.length ).toBe( 1 );
		expect( DB.find ).toHaveBeenCalledWith( oStartData );

		expect( DOM.byClass.calls.length ).toBe( 1 );
		expect( DOM.byClass ).toHaveBeenCalledWith( '.current-user' );
	} );
} );
```
