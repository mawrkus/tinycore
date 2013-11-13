/**
 * Storage capabilities tool.
 * The method chosen is localStorage, if available.
 */
TinyCore.Toolbox.register( 'storage', function ()
{
	'use strict';

	var win = window,
		oStorage = {
			get : function () {},
			set : function () {}
		};

	if ( win.localStorage && win.JSON )
	{
		oStorage = {
			set : function ( sKey, oItem )
			{
				win.localStorage.setItem( sKey, win.JSON.stringify( oItem ) );
			},
			get : function ( sKey )
			{
				return win.JSON.parse( win.localStorage.getItem( sKey ) );
			}
		};
	}

	return oStorage;
} );
