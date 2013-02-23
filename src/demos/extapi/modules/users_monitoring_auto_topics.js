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
			this.oContainer = this.oContainer || _oDomUtils.getById( oStartData.containerID );

			_oDomUtils.append( this.oContainer, '<p class="sys_msg">Starting users monitoring...</p>' );
		},

		/**
		 * This method will be called when the module is stopped.
		 */
		onStop : function ()
		{
			_oDomUtils.append( this.oContainer, '<p class="sys_msg">Stopping users monitoring...</p>' );
		},

		/**
		 * This method will be called when the module is destroyed.
		 */
		onDestroy : function ()
		{
			_oDomUtils.append( this.oContainer, '<p class="sys_msg">Destroying users monitoring...</p>' );
			this.oContainer = null;
		},

		/**
		 * The topics and their related handlers. All subscriptions are automatic when the module is started.
		 * @type {Object}
		 */
		topics : {
			'user:connected' : function ( oTopic )
			{
				this.displayUserActivity( 'connexion', oTopic.data.username );
			},
			'user:disconnected' : function ( oTopic )
			{
				this.displayUserActivity( 'disconnexion', oTopic.data.username );
			},
			'user:message' : function ( oTopic )
			{
				this.displayMessage( oTopic.data.username, oTopic.data.text );
			}
		},

		/**
		 * Displays the user activity.
		 * @param {String} sActivityType
		 * @param {String} sUserName
		 */
		displayUserActivity : function ( sActivityType, sUserName )
		{
			_oDomUtils.append( this.oContainer, '<p>'+ new Date + '> ' + sActivityType + ' : ' + sUserName + '</p>' );
		},

		/**
		 * Displays the user message.
		 * @param {String} sActivityType
		 * @param {String} sUserName
		 */
		displayMessage : function ( sUserName, sMsg )
		{
			_oDomUtils.append( this.oContainer, '<p>'+ new Date + '> ' + sUserName + ' says : ' + sMsg + '</p>' );
		},

		/**
		 * The container element used to display user activity.
		 * @type {DOM Element}
		 */
		oContainer : null
	};
}, 'basic' );