/**
 * The app module, responsible for starting/stopping widget modules.
 */
TinyCore.Module.define( 'app', ['mediator', 'events'], function ( _mediator, _events )
{
	'use strict';

	// Constants.
	var CLASS_DISABLED = 'disabled';

	// The module.
	return {
		startLink0 : document.getElementById( 'start0' ),
		stopLink0 : document.getElementById( 'stop0' ),
		startLink1 : document.getElementById( 'start1' ),
		stopLink1 : document.getElementById( 'stop1' ),
		/**
		 * This method is called when the module is started.
		 * @param  {Object} oStartData The start data.
		 */
		onStart : function ( oStartData )
		{
			TinyCore.Module.start( 'activity-log', { element : document.getElementById( 'activity-view' ) } );

			_events.on( this.startLink0, 'click', this.startWidget );
			_events.on( this.stopLink0, 'click', this.stopWidget );
			_events.on( this.startLink1, 'click', this.startWidget );
			_events.on( this.stopLink1, 'click', this.stopWidget );
		},
		/**
		 * This method is called when the module is stopped.
		 */
		onStop : function ()
		{
			_events.off( this.stopLink1, 'click', this.stopWidget );
			_events.off( this.startLink1, 'click', this.startWidget );
			_events.off( this.stopLink0, 'click', this.stopWidget );
			_events.off( this.startLink0, 'click', this.startWidget );

			TinyCore.Module.stop( 'activity-log' );
		},
		/**
		 * Starts the widget module.
		 * @param {Event} eEvent
		 */
		startWidget : function ( eEvent )
		{
			var sModuleName = this.href.split( '#' )[1],
				sLinkNum = this.id.substr( -1 ),
				oWidget = document.getElementById( sModuleName );

			eEvent.preventDefault();

			TinyCore.Module.start( sModuleName, { element : oWidget } );

			this.className = CLASS_DISABLED;
			document.getElementById( 'stop'+sLinkNum ).className = '';

			_mediator.publish( 'widget:enable', { targetID : sModuleName } );
		},
		/**
		 * Stops the widget module.
		 * @param {Event} eEvent
		 */
		stopWidget : function ( eEvent )
		{
			var sModuleName = this.href.split( '#' )[1],
				sLinkNum = this.id.substr( -1 );

			eEvent.preventDefault();

			_mediator.publish( 'widget:disable', { targetID : sModuleName } );

			TinyCore.Module.stop( sModuleName );

			this.className = CLASS_DISABLED;
			document.getElementById( 'start'+sLinkNum ).className = '';
		}
	};
} );
