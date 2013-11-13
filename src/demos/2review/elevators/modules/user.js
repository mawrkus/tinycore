/**
 * The user module.
 * Topics subscribed :
 * Topics published : "elevator:call"
 */
TinyCore.Module.register( 'user', function ( oSandBox )
{
	'use strict';
	
	// Shortcuts.
	var _dom = oSandBox.dom,
		_events = oSandBox.events;

	// The module.
	return {
		/**
		 * This method will be called when the module is started.
		 * @param  {Object} oStartData The start data.
		 */
		onStart : function ( oStartData )
		{
			_events.bind( document, 'click', this.onClick );
		},

		/**
		 * This method will be called when the module is stopped.
		 */
		onStop : function ()
		{
			_events.unbind( document, 'click', this.onClick );
		},

		/**
		 * If a button to call an elevator is clicked, publishes a topic with the origin and destination floors.
		 * @param  {Event} eEvent The click event object
		 */
		onClick : function ( eEvent )
		{
			var oTarget = eEvent.target;

			// Event delegation.
			while ( oTarget !== document )
			{
				if ( _dom.hasClass( oTarget, 'call-elevator' ) )
				{
					oSandBox.publish( 'elevator:call', {
						userFloor : parseInt( _dom.getData( oTarget, 'user-floor' ), 10 ),
						userDestFloor : parseInt( _dom.getData( oTarget, 'dest-floor' ), 10 )
					} )
					break;
				}
				oTarget = oTarget.parentNode;
			}
		}
	};	
}, 'domlib_sandbox' );