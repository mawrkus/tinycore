/**
 * The "activity-log" module, responsible for logging the widgets activity.
 *
 * Topics subscribed : "activity:log"
 */
TinyCore.Module.define( 'activity-log', ['mediator'], function ( _mediator )
{
	'use strict';

	// Private variables and helpers.
	var _fpFormatTime = function ( nTimestamp )
		{
			var oDate = new Date( nTimestamp ),
				aParts = [ oDate.getHours(), oDate.getMinutes(), oDate.getSeconds() ],
				nIndex = aParts.length;

			while ( nIndex-- )
			{
				if ( aParts[nIndex] < 10 ) aParts[nIndex] = '0' + aParts[nIndex];
			}

			return aParts.join( ':' );
		};

	// The module.
	return {
		/**
		 * The logs container
		 * @type {DOM Element}
		 */
		element : null,
		/**
		 * This method is called when the module is started.
		 * @param  {Object} oStartData The start data.
		 */
		onStart : function ( oStartData )
		{
			this.element = oStartData.element;

			_mediator.subscribe( 'log:add', function ( oTopic )
			{
				this.log( oTopic.data );
			}, this );
		},
		/**
		 * This method is called when the module is stopped.
		 */
		onStop : function ()
		{
		},
		/**
		 * Logs messages.
		 * @param {Object} oLogData
		 * @param {Number} oLogData.timestamp
		 * @param {String} oLogData.src
		 * @param {String} oLogData.msg
		 */
		log : function ( oLogData )
		{
			var aParts = [],
				sMsg;

			aParts.push( '['+_fpFormatTime( oLogData.timestamp )+'] ' );
			aParts.push( '<strong>'+oLogData.src+'&gt;</strong> ' );
			aParts.push( oLogData.msg );

			sMsg = aParts.join( '' );

			this.element.innerHTML += '<p class="activity">'+sMsg+'</p>';
			this.element.scrollTop = this.element.scrollHeight;
		}
	};
} );
