/**
 * TinyCore.js
 * A tiny yet extensible JS modular architecture.
 * @author mawrkus (web@sparring-partner.be)
*/
;( function ( oEnv )
{
	'use strict';

	var _null_ = null,
		_true_ = true,
		_false_ = false,
		_oObjectProto = Object.prototype,
		_hasOwnProp = _oObjectProto.hasOwnProperty,
		_toString = _oObjectProto.toString;

	/**
	 * The core
	 * @type {Object}
	 */
	var TinyCore = {
		/**
		 * Current version
		 * @type {String}
		 */
		version : '1.0.2',
		/**
		 * Debug mode : if true, error in modules methods and topics subscribers will not be caught,
		 * if false, errors will be caught and logged using the error handler.
		 * @type {Boolean}
		 */
		debugMode : _false_,
		/**
		 * The modules manager.
		 * @type {Object}
		 */
		Module : _null_,
		/**
		 * The tools factory.
		 * @type {Object}
		 */
		Toolbox : _null_,
		/**
		 * The error handler.
		 * @type {Object}
		 */
		Error : _null_,
		/**
		 * Utilities functions.
		 * @type {Object}
		 */
		Utils : _null_
	};
