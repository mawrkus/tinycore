define( ['lib/plot.js'], function ( oPlot )
{
	return function ( oSandBox )
	{
		return  {
			onStart : function ( oData )
			{
				console.info( 'Starting chart module...', oData );

				oSandBox.subscribe( ['app:filter:change', 'app:filter:reset'], function ( oEvent )
				{
					console.log( 'Chart module received a notification : ', oEvent.type, oEvent.data );
				} );

				console.log( 'Chart can use plot lib', oPlot );

				oPlot.init();
				oPlot.draw( oData.type );
			},
			onStop : function ()
			{
				console.info( 'Stopping chart module...' );
				oSandBox.publish( 'app:chart:stop');
			}
		};
	};
} );