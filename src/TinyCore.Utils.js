/**
 * Utilities for TinyCore.js
 * @author mawrkus (web@sparring-partner.be)
*/
;( function ( oEnv )
{
	'use strict';

	var TinyCore = oEnv.TinyCore;

	var _oObjectProto = Object.prototype,
		_hasOwnProp = _oObjectProto.hasOwnProperty,
		_toString = _oObjectProto.toString;

	/* ES5 shims, from MDN. */

	if ( !Array.prototype.forEach )
	{
		Array.prototype.forEach = function( fn, scope )
		{
			var i, len;
			for ( i = 0, len = this.length; i < len; ++i )
			{
				if ( i in this )
				{
					fn.call( scope, this[ i ], i, this );
				}
			}
		};
	}

	if ( !Function.prototype.bind )
	{
		Function.prototype.bind = function( oThis )
		{
			if ( typeof this !== "function" )
			{
				// closest thing possible to the ECMAScript 5 internal IsCallable function
				throw new TypeError( "Function.prototype.bind - what is trying to be bound is not callable" );
			}

			var aArgs = Array.prototype.slice.call( arguments, 1 ),
				fToBind = this,
				fNOP = function( ) {},
				fBound = function( )
				{
					return fToBind.apply( this instanceof fNOP && oThis ? this : oThis,
						aArgs.concat( Array.prototype.slice.call( arguments ) ) );
				};

			fNOP.prototype = this.prototype;
			fBound.prototype = new fNOP();

			return fBound;
		};
	}

	if ( !String.prototype.trim )
	{
		String.prototype.trim = function( )
		{
			return this.replace( /^\s+|\s+$/g, '' );
		};
	}

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
			var args = arguments,
				nArgsCount = args.length,
				nIndex = 1,
				oDest = args[0] || {},
				fpCopy = function ( val, key )
				{
					oDest[key] = _oUtils.isObject( val ) ? _oUtils.extend( oDest[key], val ) : val;
				};

			for ( ; nIndex<nArgsCount; nIndex++ )
			{
				_oUtils.forEach( args[nIndex], fpCopy );
			}

			return oDest;
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
		 * Creates a new module object.
		 * @param  {Function} fpCreator
		 * @param  {Array} aArgs
		 * @return {Object}
		 */
		createModuleObject : function ( fpCreator, aArgs )
		{
			return fpCreator.apply( null, aArgs );
		}
	};

	// Define TinyCore a little bit more.
	TinyCore.Utils = _oUtils;

} ( this ) );
