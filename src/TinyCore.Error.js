/**
 * Error handling for TinyCore.js
 * @author Mawrkus (web@sparring-partner.be)
*/
;( function ( oEnv )
{
	'use strict';

	var TinyCore = oEnv.TinyCore;

	/**
	 * * The error handler.
	 * @type  {Object}
	 */
	var _oErrorHandler = {
		/**
		 * * Logs an error message.
		 * @param  {String} sMsg
		 */
		log : function ( sMsg )
		{
			if ( oEnv.console && oEnv.console.error )
			{
				oEnv.console.error( sMsg );
			}
		}
	};

	// Define TinyCore a little bit more.
	TinyCore.Error = _oErrorHandler;

} ( this ) );
