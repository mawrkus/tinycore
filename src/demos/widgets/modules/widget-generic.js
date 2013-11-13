/**
 * The "widget-generic" module, mainly responsible for automatically subscribing to topics and adding DOM events listeners when started.
 * Also publishes topics for logging information (see the "activity-log" module).
 * It's the base module for the "widget-text" and the "widget-select" modules.
 *
 * Topics subscribed : "widget:enable", "widget:disable"
 * Topics published : "log:add"
 */
TinyCore.Module.define( 'widget-generic', ['mediator', 'events'], function ( _mediator, _events )
{
	'use strict';

	// Private variables and helpers.
	var _oAttachedEvents = {},
		_fpSlice = Array.prototype.slice,
		_fpToArray = function ( mixed )
		{
			return _fpSlice.call( mixed );
		};

	// The module.
	return {
		/**
		 * Topics to automatically subscribe to.
		 * @type {Object}
		 */
		topics : {
			'widget:enable' : function ( oTopic )
			{
				if ( oTopic.data.targetID !== this.element.id )
				{
					return;
				}

				this.logActivity( 'widget-generic', '"'+oTopic.name+'" received (#'+oTopic.data.targetID+')' );

				_fpToArray( this.element.querySelectorAll( 'input, button, select' ) ).forEach( function ( oInput )
				{
					oInput.removeAttribute( 'disabled' );
				} );
			},
			'widget:disable' : function ( oTopic )
			{
				if ( oTopic.data.targetID !== this.element.id )
				{
					return;
				}

				this.logActivity( 'widget-generic', '"'+oTopic.name+'" received (#'+oTopic.data.targetID+')' );

				_fpToArray( this.element.querySelectorAll( 'input, button, select' ) ).forEach( function ( oInput )
				{
					oInput.setAttribute( 'disabled', 'disabled' );
				} );
			}
		},
		/**
		 * Events to automatically add listeners to.
		 * @type {Object}
		 */
		events : {
			'focus input' : function ( eEvent )
			{
				this.logActivity( 'widget-generic', 'focus on input' );
			},
			'focus select' : function ( eEvent )
			{
				this.logActivity( 'widget-generic', 'focus on select' );
			}
		},
		/**
		 * This method is called when the module is started.
		 * @param  {Object} oStartData The start data.
		 */
		onStart : function ( oStartData )
		{
			this.logActivity( 'widget-generic', 'onStart' );

			// "Automatic setup", IN THE CONTEXT OF THE INHERITED MODULE.
			this.element = oStartData.element;
			this.subscribeTopics();
			this.addEventsListeners();
		},
		/**
		 * Subscribes to all topics defined in the module.
		 */
		subscribeTopics : function ( oContext )
		{
			this.logActivity( 'widget-generic', 'subscribeTopics' );

			var self = this;

			TinyCore.Utils.forEach( self.topics, function ( fpHandler, sTopicName )
			{
				_mediator.subscribe( sTopicName, fpHandler, self );
			} );
		},
		/**
		 * Adds events listeners to all events defined in the module.
		 */
		addEventsListeners : function ()
		{
			this.logActivity( 'widget-generic', 'addEventsListeners' );

			var self = this;

			TinyCore.Utils.forEach( self.events, function ( fpHandler, sEventAndSelector )
			{
				var sParts = sEventAndSelector.split( ' ' ),
					sEventName = sParts[0],
					sSelector = sParts[1],
					oElement = self.element.querySelector( sSelector ),
					fpContextualHandler = fpHandler.bind( self );

				_events.on( oElement, sEventName, fpContextualHandler );

				_oAttachedEvents[sEventAndSelector] = {
					element : oElement,
					eventName : sEventName,
					handler : fpContextualHandler
				};
			} );
		},
		/**
		 * This method is called when the module is stopped.
		 */
		onStop : function ()
		{
			this.logActivity( 'widget-generic', 'onStop' );

			_mediator.unsubscribeAll();

			TinyCore.Utils.forEach( _oAttachedEvents, function ( oEventData )
			{
				_events.off( oEventData.element, oEventData.eventName, oEventData.handler );
			} );
		},
		/**
		 * Logs some messages.
		 * @param {String} sSrc
		 * @param {String} sMsg
		 */
		logActivity : function ( sSrc, sMsg )
		{
			_mediator.publish( 'log:add', { timestamp : +new Date(), src : sSrc, msg : sMsg } );
		}
	};
} );
