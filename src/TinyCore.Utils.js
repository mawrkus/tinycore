/**
 * Utilities for TinyCore.js
 * @author Mawrkus (web@sparring-partner.be)
*/
;( function ( oEnv )
{
	'use strict';

	var TinyCore = oEnv.TinyCore;

	var _oObjectProto = Object.prototype,
		_hasOwnProp = _oObjectProto.hasOwnProperty,
		_toString = _oObjectProto.toString,
		_slice = Array.prototype.slice;

	/**
	 * TinyCore.js utilities functions.
	 * @type {Object}
	 */
	var _oUtils = {
		/**
		 * Determines the class of an object.
		 * @type {Function}
		 * @param {Mixed} mixed
		 * @return {Boolean}
		*/
		isClass : function ( mixed, sClassName )
		{
			return _toString.call( mixed ) === '[object '+sClassName+']';
		},
		/**
		 * Determine if the parameter is a function.
		 * @type {Function}
		 * @param {Mixed} mixed
		 * @return {Boolean}
		*/
		isFunction : function ( mixed )
		{
			return _oUtils.isClass( mixed, 'Function' );
		},
		/**
		 * Determine if the parameter is an object.
		 * @type {Function}
		 * @param {Mixed} mixed
		 * @return {Boolean}
		*/
		isObject : function ( mixed )
		{
			return _oUtils.isClass( mixed, 'Object' );
		},
		/**
		 * Determine if the parameter is an array.
		 * @type {Function}
		 * @param {Mixed} mixed
		 * @return {Boolean}
		*/
		isArray : function ( mixed )
		{
			return _oUtils.isClass( mixed, 'Array' );
		},
		/**
		 * Runs through all the properties of an object, applying a callback function on each of them.
		 * @type {Function}
		 * @param {Object} oObject
		 * @param {Function} fpCallback
		 */
		forEach : function ( oObject, fpCallback )
		{
			if ( !oObject || !_oUtils.isObject( oObject ) )
			{
				return;
			}

			for ( var sProperty in oObject )
			{
				if ( _hasOwnProp.call( oObject, sProperty ) )
				{
					fpCallback( oObject[sProperty], sProperty );
				}
			}
		},
		/**
		 * Merges deeply several objects.
		 * @type {Function}
		 * @param {Object} oDest  The destination object
		 * @param {Object} oObj1 The 1st object to merge
		 * @param {Object} oObj2 The 2nd object to merge
		 * ...
		 * @return {Object}
		*/
		extend : function ()
		{
			var nArgsCount = arguments.length,
				nIndex = 1,
				oDest = arguments[0] || {},
				fpCopy = function ( val, key )
				{
					oDest[key] = _oUtils.isObject( val ) ? _oUtils.extend( oDest[key], val ) : val;
				};

			for ( ; nIndex<nArgsCount; nIndex++ )
			{
				_oUtils.forEach( arguments[nIndex], fpCopy );
			}

			return oDest;
		},
		/**
		 * Converts an array-like object to a real array.
		 * @type {Function}
		 * @param {Mixed} mixed
		 * @return {Array}
		*/
		toArray : function ( mixed )
		{
			return _slice.call( mixed );
		},
		/**
		 * "try-catch" function decoration with logging in case of error.
		 * Avoid double decoration if called twice on the same function.
		 * @type {Function}
		 * @param {Object} oContext
		 * @param {Function} fpFunc
		 * @param {String} sErrMsg
		 * @return {Function}
		*/
		tryCatchDecorator : function ( oContext, fpFunc, sErrMsg )
		{
			if ( fpFunc.__decorated__ )
			{
				return fpFunc;
			}

			var fpDecoratedFunc = function ()
			{
				try
				{
					return fpFunc.apply( oContext, arguments );
				}
				catch ( eError )
				{
					TinyCore.Error.log( sErrMsg + eError.message );
				}
			};

			fpDecoratedFunc.__decorated__ = true;

			return fpDecoratedFunc;
		},
		/**
		 * Creates a new function that will be executed in the context passed as parameter.
		 * @param {Object} oContext
		 * @param {Function} fpFunc
		 * @return {Function}
		 */
		bind : function ( oContext, fpFunc )
		{
			return function ()
			{
				fpFunc.apply( oContext, arguments );
			};
		}
	};

	// Define TinyCore a little bit more.
	TinyCore.Utils = _oUtils;

} ( this ) );
