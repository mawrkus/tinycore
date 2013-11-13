define( ['TinyCore', 'filter', 'lib/plot.js'], function ( TinyCore, sFilter, oPlot )
{
	'use strict';
	
	TinyCore.Module.register( 'chart', function ( oSandBox )
	{
		return  {
			onStart : function ( oStartData )
			{
				console.info( 'Starting chart module...', oStartData );

				oSandBox.subscribe( ['filter:change', 'filter:reset'], function ( oTopic )
				{
					console.log( 'Chart module received a filter notification : ', oTopic.name, oTopic.data );
				} );

				console.log( 'Chart can use plot lib', oPlot );

				oPlot.init();
				oPlot.draw( oStartData.graphType );

				TinyCore.Module.start( 'filter', { startDate : new Date() } );
			},
			onStop : function ()
			{
				console.info( 'Stopping chart module...' );
				oSandBox.publish( 'chart:stop' );
			}
		};
	} );

	return 'chart';
} );