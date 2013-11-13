/**
 * The app module, responsible for creating and destroying chat clients.
 * Controls the hub lifecycle and communicates with it to check if user access is permitted.
 *
 * Topics subscribed : "hub:access:granted", "hub:access:refused", "user:exit"
 * Topics published : "hub:access:request"
 */
TinyCore.Module.define( 'app', ['mediator', 'events'], function ( _mediator, _events )
{
	'use strict';

	var _oNewUserForm;

	// The module.
	return {
		/**
		 * This method is called when the module is started.
		 * @param  {Object} oStartData The start data.
		 */
		onStart : function ( oStartData )
		{
			_oNewUserForm = document.getElementById( 'new-user-form' );

			_mediator.subscribe( 'hub:access:granted', function ( oTopic )
			{
				var sUsername = oTopic.data.username;
				TinyCore.Module.startInstance( 'chat_client', sUsername, { username : sUsername, containerID : 'chat-windows' } );
			}, this );

			_mediator.subscribe( 'hub:access:refused', function ( oTopic )
			{
				var sErrMsg = oTopic.data.message;
				alert( sErrMsg );
			}, this );

			_mediator.subscribe( 'user:exit', function ( oTopic )
			{
				var sUsername = oTopic.data.username;
				TinyCore.Module.stopInstance( 'chat_client', sUsername, true );
			}, this );

			TinyCore.Module.start( 'hub' );

			_events.on( _oNewUserForm, 'submit', this.requestAccess );
		},
		/**
		 * This method is called when the module is stopped.
		 */
		onStop : function ()
		{
			_events.off( _oNewUserForm, 'submit', this.requestAccess );

			TinyCore.Module.stop( 'hub' );

			_mediator.unsubscribeAll();
		},
		/**
		 * Requests access to the chat.
		 */
		requestAccess : function ( eEvent )
		{
			var oUsernameInput = document.getElementById( 'username' ),
				sUsername = oUsernameInput.value;

			oUsernameInput.value = '';

			eEvent.preventDefault();

			_mediator.publish( 'hub:access:request', { username : sUsername } );
		}
	};
} );
