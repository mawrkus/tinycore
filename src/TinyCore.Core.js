/**
 * TinyCore.js
 * A tiny yet extensible JS modular architecture.
 * @author Mawrkus (web@sparring-partner.be)
*/
;( function ( oEnv )
{
	'use strict';

	/**
	 * The core
	 * @type {Object}
	 */
	var _oTinyCore = {
		/**
		 * Current version
		 * @type {String}
		 */
		version : '0.5.0',
		/**
		 * Debug mode : if true, error in modules methods and topics subscribers will not be caught,
		 * if false, errors will be caught and logged using the error handler.
		 * @type {Boolean}
		 */
		debugMode : false,
		/**
		 * The modules manager.
		 * @type {Object}
		 */
		Module : null,
		/**
		 * The tools factory.
		 * @type {Object}
		 */
		Toolbox : null,
		/**
		 * The error handler.
		 * @type {Object}
		 */
		Error : null,
		/**
		 * Utilities functions.
		 * @type {Object}
		 */
		Utils : null
	};

	// Add TinyCore to the environment.
	oEnv.TinyCore = _oTinyCore;

} ( this ) );
