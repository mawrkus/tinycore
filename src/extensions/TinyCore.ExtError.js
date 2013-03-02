/**
 * Extended error handler for TinyCore.js
 * @author Mawkus aka Marc Mignonsin (web@sparring-partner.be)
 * @requires TinyCore.js
*/
;( function ( oEnv )
{
	'use strict';

	var TinyCore = oEnv.TinyCore;

	if ( !TinyCore )
	{
		throw new Error( 'Cannot extend TinyCore: TinyCore seems to be missing!' );
	}

	/**
	 * * The extended error handler
	 * @type  {Object}
	 */
	var _oExtErrorHandler = {
		/**
		 * Logs an error message using the console if it exists, or DOM if not
		 * @param  {String} sMsg
		 */
		log : ( function ( oEnv, oConsole, oDoc )
		{
			var oLog;

			if ( oConsole )
			{
				return function ( sMsg )
				{
					oConsole.error( sMsg );
				} 
			}
			else if ( oDoc )
			{
				oLog = oDoc.createElement( 'div' );
				oLog.id = 'tinycore-log';
				oLog.setAttribute( 'style', 'font-family:Verdana,Arial,sans-serif; font-size:10px; position:fixed; bottom:0; left:0; width:100%; height:20%; overflow-y:auto; padding:5px; color:#FFF; border-top:1px solid #AA0000; background-color:#FF3300;' );

				return function ( sMsg )
				{
					var oMsg = oDoc.createElement( 'p' ),
						oText = oDoc.createTextNode( new Date() + '> '+sMsg );

					oMsg.className = 'tinycore-log-error';
					oMsg.appendChild( oText );

					if ( !oDoc.getElementById( 'tinycore-log' ) )
					{
						oDoc.body.appendChild( oLog );
					}

					oLog.appendChild( oMsg );
				} 
			}
		} ( oEnv, oEnv.console, oEnv.document ) )
	};

	// Extend TinyCore
	TinyCore.extend( { ErrorHandler : _oExtErrorHandler } );
} ( this ) );