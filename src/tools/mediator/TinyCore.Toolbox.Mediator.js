/**
 * A mediator implementation for the TinyCore.js modules.
 * @author mawrkus (web@sparring-partner.be)
 * @requires TinyCore
*/
;( function ( oEnv )
{
	'use strict';

	var TinyCore = oEnv.TinyCore,
		Utils = TinyCore.Utils;

	/**
	 * The one and only mediator.
	 * param {Number} nID The internal mediator ID
	 */
	var Mediator = function ( nID )
	{
		this.nSubscriberID = nID;
	};

	Mediator.prototype = ( function ()
	{
		/**
		 * The topics data, e.g. :
		 * {
		 *	'graph:color:change' : { 0:fn0, 3:fn3 },
		 *	'filter:date:change' : { 1:fn1, 2:fn2 ,3:fn3 }
		 * }
		 * 0, 1, 2, 3 are the IDs of the subscribers and fn0, fn1, fn2, fn3, their related handlers.
		 * @type {Object}
		 */
		var _oTopic2Subs = {},
			/**
			 * The subscribers data, given a subscriber's ID, this will allow us to retrieve easily all the topics subscribed, e.g. :
			 * {
			 *	0 : [ 'graph:color:change' ],
			 *  1 : [ 'filter:date:change' ],
			 *  2 : [ 'filter:date:change' ],
			 *  3 : [ 'graph:color:change', 'filter:date:change' ],
			 * }
			 * 0, 1, 2, 3 are the IDs of the subscribers.
			 * @type {Object}
			 */
			_oSub2Topics = {};

		return {
			/**
			 * Subscribes to one or more topics.
			 * @param {String|Array} topics A topic name or an array of topics to subscribe to
			 * @param {Function} fpHandler The topic handler
			 * @param {Object} oContext Optional, the context in which the handler should be executed
			 */
			subscribe : function ( topics, fpHandler, oContext )
			{
				var aTopics = Utils.isArray( topics ) ? topics : [topics],
					nSubscriberID = this.nSubscriberID;

				aTopics.forEach( function ( sTopic )
				{
					_oTopic2Subs[sTopic] = _oTopic2Subs[sTopic] || {};

					// Don't allow the same subscriber twice.
					if ( !_oTopic2Subs[sTopic][nSubscriberID] )
					{
						// Catch handler errors?
						_oTopic2Subs[sTopic][nSubscriberID] = TinyCore.debugMode ?
														fpHandler.bind( oContext ) :
														Utils.tryCatchDecorator( oContext, fpHandler, 'Error publishing topic "' + sTopic + '": ' );

						_oSub2Topics[nSubscriberID] = _oSub2Topics[nSubscriberID] || [];
						_oSub2Topics[nSubscriberID].push( sTopic );
					}
				} );
			},
			/**
			 * Publishes a topic.
			 * @param {String} sTopic
			 * @param {Object} oData
			 * @param {Boolean} bDontCopyData
			 */
			publish : function ( sTopic, oData, bDontCopyData )
			{
				var oDataOrCopy = bDontCopyData ? oData : oData && Utils.extend( {}, oData );

				Utils.forIn( _oTopic2Subs[sTopic], function ( fpHandler )
				{
					// Just in case, delay the handler execution after what's currently in line.
					oEnv.setTimeout( function ()
					{
						fpHandler( { name : sTopic, data : oDataOrCopy } );
					}, 0 );
				} );
			},
			/**
			 * Unsubscribes from one or more topics.
			 * @param {String|Array} topics A topic or an array of topics to unsubscribe from
			 */
			unsubscribe : function ( topics )
			{
				var aTopics = Utils.isArray( topics ) ? topics : [topics],
					nTopicsCount = aTopics.length,
					oSubs,
					nSubscriberID = this.nSubscriberID;

				while ( nTopicsCount-- )
				{
					oSubs = _oTopic2Subs[aTopics[nTopicsCount]];
					if ( oSubs && oSubs[nSubscriberID] )
					{
						delete oSubs[nSubscriberID];
					}
				}
			},
			/**
			 * Unsubscribes from all subscribed topics.
			 */
			unsubscribeAll : function ()
			{
				if ( _oSub2Topics[this.nSubscriberID] )
				{
					this.unsubscribe( _oSub2Topics[this.nSubscriberID] );
				}
			}
		};
	} () );

	// Add our mediator factory to the available TinyCore tools.
	TinyCore.Toolbox.register( 'mediator', function ( nID )
	{
		return new Mediator( nID );
	} );

} ( this ) );
