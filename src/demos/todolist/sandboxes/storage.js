/**
 * A sandbox with storage capabilities.
 * The method chosen is localStorage, if available.
 */
TinyCore.SandBox.register( 'storage_sandbox', ( function ( win )
{
	var oStorage = {
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

	return {
		storage : oStorage
	};
} ( window ) ) );