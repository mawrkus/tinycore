/**
 * The hub module, responsible for broadcasting users activity and messages to all chat clients.
 * Also checks for new user access.
 *
 * Topics subscribed : "hub:access:request", "user:enter", "user:writing", "user:exit", "user:message"
 * Topics published : "hub:access:granted", "hub:access:refused", "hub:user:activity", "hub:user:message"
 */

TinyCore.Module.define( 'hub', ['mediator'], function ( _mediator )
{
	'use strict';

	// Private variables and helpers.
	var _oUsersData = {},
		_msg = function ( sMsg, sVar )
		{
			return sMsg.replace( '%1', sVar );
		};

	// Constants.
	var MSG_USER_ENTER = '%1 has joined the chat!',
		MSG_USER_WRITING = '%1 is writing a message...',
		MSG_USER_EXIT = '%1 has left the chat.',
		MSG_ERR_INVALID_USERNAME = 'The username "%1" is invalid!',
		MSG_ERR_USER_ALREADY_ENTERED = 'The username "%1" is already taken!';

	// The module.
	return {
		/**
		 * This method is called when the module is started.
		 * @param  {Object} oStartData The start data.
		 */
		onStart : function ( oStartData )
		{
			_mediator.subscribe( 'hub:access:request', function ( oTopic )
			{
				var oUserData = oTopic.data;

				if ( _oUsersData[oUserData.username] )
				{
					_mediator.publish( 'hub:access:refused', { username : oUserData.username, message : _msg( MSG_ERR_USER_ALREADY_ENTERED, oUserData.username ) } );
				}
				else if ( oUserData.username === '' )
				{
					_mediator.publish( 'hub:access:refused', { username : oUserData.username, message : _msg( MSG_ERR_INVALID_USERNAME, oUserData.username ) } );
				}
				else
				{
					_oUsersData[oUserData.username] = {
						entry : +new Date()
					};

					_mediator.publish( 'hub:access:granted', { username : oUserData.username } );
				}
			} );

			_mediator.subscribe( 'user:enter', function ( oTopic )
			{
				var oUserData = oTopic.data;
				this.publishTopic( 'activity', oUserData.username, _msg( MSG_USER_ENTER, oUserData.username ) );
			}, this );

			_mediator.subscribe( 'user:writing', function ( oTopic )
			{
				var oUserData = oTopic.data;
				this.publishTopic( 'activity', oUserData.username, _msg( MSG_USER_WRITING, oUserData.username ) );
			}, this );

			_mediator.subscribe( 'user:exit', function ( oTopic )
			{
				var oUserData = oTopic.data;
				delete _oUsersData[oUserData.username];
				this.publishTopic( 'activity', oUserData.username, _msg( MSG_USER_EXIT, oUserData.username ) );
			}, this );

			_mediator.subscribe( 'user:message', function ( oTopic )
			{
				var oUserData = oTopic.data;
				this.publishTopic( 'message', oUserData.username, oUserData.message );
			}, this );
		},
		/**
		 * Helper, publishes a timetsamped topic.
		 * @param {sType} The topic type : "activity" or "message"
		 * @param {sUsername}
		 * @param {sMsg}
		 */
		publishTopic : function ( sType, sUsername, sMsg )
		{
			_mediator.publish( 'hub:user:'+sType, { timestamp : +new Date(), username : sUsername, message : sMsg } );
		},
		/**
		 * This method is called when the module is stopped.
		 */
		onStop : function ()
		{
			_mediator.unsubscribeAll();
		}
	};
} );
