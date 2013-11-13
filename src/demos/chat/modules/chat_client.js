/**
 * The chat client module, allowing the user to type messages and be notified of the other useres activity.
 *
 * Topics subscribed : "hub:user:activity", "hub:user:message"
 * Topics published : "user:enter", "user:writing", "user:message", "user:exit"
 */
TinyCore.Module.define( 'chat_client', ['mediator', 'dom', 'events'], function ( _mediator, _dom, _events )
{
	'use strict';

	// Private variables and helpers.
	var _fpFormat2Digits = function ( aParts, sSeparator)
		{
			var nIndex = aParts.length;

			while ( nIndex-- )
			{
				if ( aParts[nIndex] < 10 ) aParts[nIndex] = '0' + aParts[nIndex];
			}

			return aParts.join( sSeparator );
		},
		_fpFormatTime = function ( nTimestamp )
		{
			var oDate = new Date( nTimestamp );
			return _fpFormat2Digits( [ oDate.getHours(), oDate.getMinutes(), oDate.getSeconds() ], ':' );
		},
		_fpFormatDate = function ( nTimestamp )
		{
			var oDate = new Date( nTimestamp );
			return _fpFormat2Digits( [ oDate.getDate(), oDate.getMonth()+1, oDate.getFullYear() ], '/' );
		},
		_nTimeoutID = -1;

	// Constants.
	var KEYCODE_ENTER = 13,
		TIMEOUT_NOTIFICATION = 1500;

	// The module.
	var _oModule = {
		/**
		 * User name.
		 * @type {String}
		 */
		username : '',
		/**
		 * Chat form.
		 * @type {DOM Element}
		 */
		chatForm : null,
		/**
		 * Text input.
		 * @type {DOM Element}
		 */
		textInput : null,
		/**
		 * Messages view.
		 * @type {DOM Element}
		 */
		msgsView : null,
		/**
		 * Activity view.
		 * @type {DOM Element}
		 */
		activityView : null,
		/**
		 * Exit button.
		 * @type {DOM Element}
		 */
		exitButton : null,
		/**
		 * This method is called when the module is started.
		 * @param  {Object} oStartData The start data.
		 */
		onStart : function ( oStartData )
		{
			var oContainer;

			_oModule.username = _oModule.username || oStartData.username;

			if ( !_oModule.chatForm )
			{
				oContainer = _dom.getById( oStartData.containerID );
				_oModule.createChatWindow( oContainer );
			}

			_mediator.publish( 'user:enter', { username : _oModule.username } );

			_mediator.subscribe( 'hub:user:activity', function ( oTopic )
			{
				var oUserData = oTopic.data;
				if ( oUserData.username !== _oModule.username )
				{
					_oModule.displayUsersActivity( oUserData );
				}
			}, _oModule );

			_mediator.subscribe( 'hub:user:message', function ( oTopic )
			{
				var oUserData = oTopic.data;
				if ( oUserData.username !== _oModule.username )
				{
					_oModule.displayUserMessage( oUserData );
				}
			}, _oModule );

			_events.on( _oModule.textInput, 'keyup', _oModule.onKeyUp );
			_events.on( _oModule.chatForm, 'submit', _oModule.onSubmitMsg );
			_events.on( _oModule.exitButton, 'click', _oModule.onExitClicked );
		},
		/**
		 * This method is called when the module is stopped.
		 */
		onStop : function ()
		{
			if ( _nTimeoutID > -1 )
			{
				clearTimeout( _nTimeoutID );
			}
			_mediator.unsubscribeAll();
			_events.off( _oModule.exitButton, 'click', _oModule.onExitClicked );
			_events.off( _oModule.chatForm, 'submit', _oModule.onSubmitMsg );
			_events.off( _oModule.textInput, 'keyup', _oModule.onKeyUp );
		},
		/**
		 * This method is called when the module is destroyed.
		 */
		onDestroy : function ()
		{
			_oModule.destroyChatWindow();
		},
		/**
		 * Creates and adds a new chat window to the DOM.
		 * Initializes a few module properties related to DOM.
		 * @param {DOM Element} oContainer
		 */
		createChatWindow : function ( oContainer )
		{
			var oChatWindow = _dom.getById( 'chat-window-tpl' ).cloneNode( true );

			oChatWindow.id = _oModule.username+'-chat';
			_dom.removeClass( oChatWindow, 'tpl' );
			_dom.append( oContainer, oChatWindow );
			_dom.getByClass( 'username', oChatWindow )[0].innerHTML = _oModule.username;
			_dom.getByClass( 'start-date', oChatWindow )[0].innerHTML = _fpFormatDate( +new Date() );
			_dom.getByClass( 'start-time', oChatWindow )[0].innerHTML = _fpFormatTime( +new Date() );

			_oModule.textInput = _dom.getByClass( 'user-text', oChatWindow )[0];
			_oModule.activityView = _dom.getByClass( 'activity', oChatWindow )[0];
			_oModule.msgsView = _dom.getByClass( 'messages', oChatWindow )[0];
			_oModule.exitButton = _dom.getByClass( 'exit', oChatWindow )[0];

			_oModule.chatForm = oChatWindow;
		},
		/**
		 * Destroys a chat window by removing it from the DOM.
		 */
		destroyChatWindow : function ()
		{
			_dom.remove( _oModule.chatForm );

			_oModule.chatForm = null;
			_oModule.textInput = null;
			_oModule.activityView = null;
			_oModule.msgsView = null;
			_oModule.exitButton = null;
		},
		/**
		 * Handles the keyup event.
		 * @param {Event}
		 */
		onKeyUp : function ( eEvent )
		{
			var nKeyCode = eEvent.keyCode || eEvent.which,
				oUserData;

			if ( nKeyCode !== KEYCODE_ENTER )
			{
				oUserData = {
					username : _oModule.username,
					timestamp : +new Date()
				};

				_mediator.publish( 'user:writing', oUserData );
			}
		},
		/**
		 * Handles the submit event on the chat form (new message).
		 * @param {Event}
		 */
		onSubmitMsg : function ( eEvent )
		{
			var oUserData = {
				username : _oModule.username,
				message : _oModule.textInput.value,
				timestamp : +new Date()
			};

			eEvent.preventDefault();

			_oModule.textInput.value = '';
			_oModule.displayUserMessage( oUserData );

			_mediator.publish( 'user:message', oUserData );
		},
		/**
		 * Displays a user message in the messages view.
		 * @param {Object} oUserData
		 */
		displayUserMessage : function ( oUserData )
		{
			var p = document.createElement( 'p' );

			p.innerHTML = '<span class="username">'+oUserData.username + '</span><span class="timestamp">'+_fpFormatTime( oUserData.timestamp )+'</span>';
			_oModule.msgsView.appendChild( p );

			p = document.createElement( 'p' );
			p.innerHTML = oUserData.message;
			p.className = 'usermsg';
			_oModule.msgsView.appendChild( p );

			_oModule.msgsView.scrollTop = _oModule.msgsView.scrollHeight;
		},
		/**
		 * Displays a user activity in the activity view.
		 * @param {Object} oUserData
		 */
		displayUsersActivity : function ( oUserData )
		{
			_oModule.activityView.innerHTML = oUserData.message;

			if ( _nTimeoutID > -1 )
			{
				clearTimeout( _nTimeoutID );
			}

			_dom.addClass( _oModule.activityView, 'active' );

			_nTimeoutID = setTimeout( function ()
			{
				_oModule.activityView.innerHTML = '';
				_dom.removeClass( _oModule.activityView, 'active' );
				_nTimeoutID = -1;
			}, TIMEOUT_NOTIFICATION );
		},
		/**
		 * Handles the click event on the exit button.
		 * @param {Event}
		 */
		onExitClicked : function ( eEvent )
		{
			eEvent.preventDefault();
			_mediator.publish( 'user:exit', { username : _oModule.username } );
		}
	};

	return _oModule;
} );
