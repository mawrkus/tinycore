/**
 * The CPU module.
 * Topics subscribed : "elevator:init", "elevator:call"
 * Topics published : "elevator:goto"
 */
TinyCore.Module.register( 'cpu', function ( oSandBox )
{
	'use strict';
	
	// Shortcut qbd privqte variable.
	var _dom = oSandBox.dom,
		_utils = oSandBox.utils,
		_oElevators = {};

	// The module.
	return {
		/**
		 * This method will be called when the module is started.
		 * @param  {Object} oStartData The start data.
		 */
		onStart : function ( oStartData )
		{
			var self = this;

			oSandBox.subscribe( 'elevator:init', function ( oTopic )
			{
				console.info( oTopic.name, oTopic.data );

				var oData = oTopic.data;

				_oElevators[oData.id] = {
					id : oData.id,
					floor : oData.floor
				};
			} );

			oSandBox.subscribe( 'elevator:call', function ( oTopic )
			{
				console.info( oTopic.name, oTopic.data );

				var oData = oTopic.data;

				oSandBox.publish( 'elevator:goto', { 
					elevatorID : 'A', 
					userFloor : oData.userFloor, 
					stopFloor : oData.userDestFloor
				} );
			} );
		},

		/**
		 * This method will be called when the module is stopped.
		 */
		onStop : function ()
		{
			_oElevators = {};
		}
	};	
} );