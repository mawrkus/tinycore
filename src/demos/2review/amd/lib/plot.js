define( function ()
{
	'use strict';

	return {
		init : function ()
		{
			console.log( 'Plot lib initialized!' );
		},
		draw : function ( sShape )
		{
			console.log( 'Plot lib is drawing a '+sShape+'...' );
		}
	};
} );