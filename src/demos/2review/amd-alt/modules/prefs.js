define( ['TinyCore'], function ( TinyCore )
{
	'use strict';
	
	TinyCore.Module.register( 'prefs', function ( oSandBox )
	{
		return  {
			onStart : function ( oStartData )
			{
				console.info( 'Starting prefs module...' );
			},
			onStop : function ()
			{
				console.info( 'Stopping prefs module...' );
			}
		};
	} );

	return 'prefs';
} );