/**
 * The elevator module.
 * Topics subscribed : "elevator:goto"
 * Topics published : "elevator:init"
 */
TinyCore.Module.register( 'elevator', function ( oSandBox )
{
	'use strict';
	
	// Private variables.
	var _sID ,
		_nCurrentFloor;

	// The module.
	return {
		/**
		 * This method will be called when the module is started.
		 * @param  {Object} oStartData The start data.
		 */
		onStart : function ( oStartData, sInstanceName )
		{
			var self = this;

			_sID = sInstanceName;
			_nCurrentFloor = oStartData.floor || 0;

			oSandBox.subscribe( 'elevator:goto', function ( oTopic )
			{
				var oData = oTopic.data;

				if ( oData.elevatorID === _sID )
				{
					console.info( oTopic.name, oTopic.data );
					self.moveTo( oTopic.data.userFloor, oTopic.data.stopFloor );
				}
			} );

			oSandBox.publish( 'elevator:init', { id : _sID, floor : _nCurrentFloor } );
		},

		/**
		 * This method will be called when the module is stopped.
		 */
		onStop : function ( sInstanceName )
		{
			console.log( 'Stopping elevator '+sInstanceName+'...' );
		},

		moveTo : function ( nUserFloor, nStopFloor )
		{
			console.log( 'Elevator '+_sID+' moving from floor #'+_nCurrentFloor+'...' );
			console.log( 'Picking user@floor #'+nUserFloor+', destination floor #'+nStopFloor+'...' );
			_nCurrentFloor = nUserFloor;
		}
	};	
} );