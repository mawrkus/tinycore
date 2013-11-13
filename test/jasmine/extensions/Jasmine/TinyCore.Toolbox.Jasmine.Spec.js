// Don't catch errors.
TinyCore.debugMode = true;

/**
 * ------- TOOLBOX > REQUEST W/ JASMINE TESTS -------
 */

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
