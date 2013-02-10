define( function ()
{
	return function ( oSandBox )
	{
		return  {
			onStart : function ( oData )
			{
				console.info( 'Starting filter module...', oData );

				oSandBox.subscribe( 'app:chart:stop', function ( oEvent )
				{
					console.log( 'Filter module received a notification :', oEvent.type, oEvent.data );
				} );

				oSandBox.publish( 'app:filter:reset' );
				oSandBox.publish( 'app:filter:change', { endDate : new Date() } );
			}
		};
	};
} );