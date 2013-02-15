define( ['lib/plot.js'], function ( oPlot )
{
	return function ( oSandBox )
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
			},
			onStop : function ()
			{
				console.info( 'Stopping chart module...' );
				oSandBox.publish( 'chart:stop' );
			}
		};
	};
} );