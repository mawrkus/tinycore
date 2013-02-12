define( function ()
{
	return function ( oSandBox )
	{
		return  {
			onStart : function ( oStartData )
			{
				console.info( 'Starting filter module...', oStartData );

				oSandBox.subscribe( 'app:chart:stop', function ( oTopic )
				{
					console.log( 'Filter module received a notification :', oTopic.name, oTopic.data );
				} );

				oSandBox.publish( 'app:filter:reset' );
				oSandBox.publish( 'app:filter:change', { endDate : new Date() } );
			}
		};
	};
} );