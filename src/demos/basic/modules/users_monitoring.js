/**
 * A users monitoring module.
 * This module is responsible for listening to users activity and to display some related infos on the screen.
 * Note that this module will have access to dom and utils functions through its sandbox.
 */
TinyCore.register( 'users_monitoring', function ( oSandBox )
{
	var _oDomUtils = oSandBox.dom;

	/**
	 * The module object.
	 */
	return {
		/**
		 * This method will be called when the module is started.
		 * @param {Object} oStartData Data passed to this module when started
		 */
		onStart : function ( oStartData )
		{
			this.oContainer = _oDomUtils.getById( oStartData.containerID );

			_oDomUtils.append( this.oContainer, '<p class="sys_msg">Starting users_monitoring...</p>' );

			oSandBox.subscribe( ['user:connected', 'user:disconnected'], oSandBox.utils.proxy( this.processEvents, this ) );
		},
		/**
		 * This method will be called when the module is stopped.
		 */
		onStop : function ()
		{
			_oDomUtils.append( this.oContainer, '<p class="sys_msg">Stopping users_monitoring...</p>' );

			oSandBox.unSubscribeAll();
			
			this.oContainer = null;
		},
		/**
		 * Handles the events received via the sandbox attached to this module.
		 * @param {Object} oEvent The event object
		 */
		processEvents : function ( oEvent )
		{
			var sType = oEvent.type,
				oData = oEvent.data;

			switch ( sType )
			{
				case 'user:connected':
					_oDomUtils.append( this.oContainer, '<p>'+ new Date + '> Connexion : '+oData.username+'</p>' );
					break;

				case 'user:disconnected':
					_oDomUtils.append( this.oContainer, '<p>'+ new Date + '> Disconnexion : '+oData.username+'</p>' );
					break;

				default:
					break;
			}
		},
		/**
		 * The container element used to display user activity.
		 * @type {DOM Element}
		 */
		oContainer : null
	};
}, 'basic' );