define( function ()
{
	'use strict';
	
	return function ( oSandBox )
	{
		return  {
			onStart : function ( oStartData )
			{
				console.info( 'Starting filter module...', oStartData );

				oSandBox.subscribe( 'chart:stop', function ( oTopic )
				{
					console.log( 'Filter module received a chart notification :', oTopic.name, oTopic.data );
				} );

				oSandBox.publish( 'filter:reset' );
				oSandBox.publish( 'filter:change', { endDate : new Date() } );
			}
		};
	};
} );