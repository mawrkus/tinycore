/**
 * Error handling for TinyCore.js
 * @author mawrkus (web@sparring-partner.be)
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
		},
		/**
		 * Throws an exception if in debug mode, log the error essage if not.
		 * @param  {String} sMsg
		 */
		report : function ( sMsg )
		{
			if ( TinyCore.debugMode )
			{
				throw new Error( sMsg );
			}
			else
			{
				_oErrorHandler.log( sMsg );
			}
		}
	};

	// Define TinyCore a little bit more.
	TinyCore.Error = _oErrorHandler;

} ( this ) );
