/**
 * A mediator implementation for the TinyCore.js modules.
 * @author Mawrkus (web@sparring-partner.be)
 * @requires TinyCore
*/
;( function ( oEnv )
{
	'use strict';

	var TinyCore = oEnv.TinyCore,
		Utils = TinyCore.Utils;

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

	/**
	 * Creates a new mediator.
	 * param {Number} nID The internal mediator ID
	 * @return {Object}
	 */
	var _fpCreateMediator = function ( nID )
	{
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
					nIndex = 0,
					nTopicsCount = aTopics.length,
					sTopic;

				for ( ; nIndex < nTopicsCount; nIndex++ )
				{
					sTopic = aTopics[nIndex];
					_oTopic2Subs[sTopic] = _oTopic2Subs[sTopic] || {};

					// Don't allow the same subscriber twice.
					if ( !_oTopic2Subs[sTopic][nID] )
					{
						// Catch handler errors?
						_oTopic2Subs[sTopic][nID] = TinyCore.debugMode ?
														Utils.bind( oContext, fpHandler ) :
														Utils.tryCatchDecorator( oContext, fpHandler, 'Error publishing topic "' + sTopic + '": ' );

						_oSub2Topics[nID] = _oSub2Topics[nID] || [];
						_oSub2Topics[nID].push( sTopic );
					}
				}
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

				Utils.forEach( _oTopic2Subs[sTopic], function ( fpHandler )
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
			unSubscribe : function ( topics )
			{
				var aTopics = Utils.isArray( topics ) ? topics : [topics],
					nTopicsCount = aTopics.length,
					oSubs;

				while ( nTopicsCount-- )
				{
					oSubs = _oTopic2Subs[aTopics[nTopicsCount]];
					if ( oSubs && oSubs[nID] )
					{
						delete oSubs[nID];
					}
				}
			},
			/**
			 * Unsubscribes from all subscribed topics.
			 */
			unSubscribeAll : function ()
			{
				if ( _oSub2Topics[nID] )
				{
					this.unSubscribe( _oSub2Topics[nID] );
				}
			}
		};
	};

	// Add our mediator factory to the available TinyCore tools.
	TinyCore.Toolbox.register( 'mediator', _fpCreateMediator );

} ( this ) );
