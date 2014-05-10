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

/* ---------  Utilities --------- */

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
	 * Utilities functions.
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
		forIn : function ( oObject, fpCallback )
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
				_oUtils.forIn( args[nIndex], fpCopy );
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

			fpDecoratedFunc.__decorated__ = _true_;

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
			return fpCreator.apply( _null_, aArgs );
		}
	};

	TinyCore.Utils = _oUtils;

/* ---------  Tools factory --------- */

	/**
	 * The available tools, each property holds a factory function that can create the tool requested.
	 * @type {Object}
	 */
	var _oTools = {},
		/**
		 * The current tool ID.
		 * @type {Number}
		 */
		_nToolID = -1;

	/**
	 * The tools factory.
	 * @type {Object}
	 */
	TinyCore.Toolbox = {
		/**
		 * Returns the tool requested.
		 * @param {String} sToolName
		 * @return {Mixed} The tool requested or null
		 */
		request : function ( sToolName )
		{
			var oToolData = _oTools[sToolName];
			return oToolData && oToolData.fpFactory && oToolData.fpFactory( ++_nToolID ) || _null_;
		},
		/**
		 * Register a new tool's factory function.
		 * @param  {String} sToolName
		 * @param  {Function} fpFactory
		 * @return {Boolean} Whether the registration was successful or not
		 */
		register : function ( sToolName, fpFactory )
		{
			if ( _oTools[sToolName] || !_oUtils.isFunction( fpFactory ) )
			{
				return _false_;
			}

			_oTools[sToolName] = {
				fpFactory : fpFactory
			};

			return _true_;
		}
	};

/* ---------  Error handling --------- */

	/**
	 * * The error handler.
	 * @type  {Object}
	 */
	TinyCore.Error = {
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
				this.log( sMsg );
			}
		}
	};

/* ---------  Modules management --------- */

	/**
	 * The modules data, where each key is a module name and the associated value an object holding the module data.
	 * @type {Object}
	 * @type {Array} oModuleData.aDependencies An array holding the IDs of the module's dependencies
	 * @type {Function} oModuleData.fpCreator The function that creates a new module's instance
	 * @type {Object} oModuleData.oInstances The module's instances data, where each key is an instance name and the associated value the instance data
	 * @type {Object} oInstanceData.oInstance A particular module instance
	 * @type {Boolean} oInstanceData.bIsStarted Whether the module instance is started or not
	 */
	var _oModulesData = {};

	/**
	 * The modules manager.
	 * @type {Object}
	 */
	TinyCore.Module = {
		/**
		 * Defines a new module.
		 * @param {String} sModuleName The module name
		 * @param {Array} aToolsNames An array of tools names, that will be requested to the Toolbox and passed as arguments of fpCreator
		 * @param {Function} fpCreator The function that creates and returns a module instance
		 * @return {Boolean} Whether the module was successfuly or not.
		 */
		define : function ( sModuleName, aToolsNames, fpCreator )
		{
			if ( _oModulesData[sModuleName] || !_oUtils.isFunction( fpCreator ) )
			{
				return _false_;
			}

			_oModulesData[sModuleName] = {
				fpCreator	: fpCreator,
				oInstances	: {},
				aToolsNames : aToolsNames
			};

			return _true_;
		},
		/**
		 * Starts a module by creating a new module instance and calling its "onStart" method with oStartData passed as parameter.
		 * @param {String} sModuleName The module name
		 * @param {Object} oStartData Optional, the data to pass to the module "onStart" method
		 * @return {Boolean} Whether the module has been started or not
		 * @throws {Error} If the module has not been defined
		 */
		start : function ( sModuleName, oStartData )
		{
			var oInstanceData = this.getInstance( sModuleName );

			if ( !oInstanceData )
			{
				// We use the module name as the default instance name.
				oInstanceData = _oModulesData[sModuleName].oInstances[sModuleName] = {
					oInstance : this.instantiate( sModuleName )
				};
			}

			if ( !oInstanceData.bIsStarted )
			{
				oInstanceData.oInstance.onStart( oStartData ); // onStart must be defined in the module.
				oInstanceData.bIsStarted = _true_;
			}

			return oInstanceData.bIsStarted;
		},
		/**
		 * Stops a module instance by calling its "onStop" method (if it exists) and by unsubscribing from all the subscribed topics.
		 * @param {String} sModuleName The module name
		 * @param {Boolean} Whether the module should also be destroyed or not
		 * @return {Boolean} Whether the module has been stopped or not
		 * @throws {Error} If the module has not been defined
		 */
		stop : function ( sModuleName, bAndDestroy )
		{
			var oInstanceData = this.getInstance( sModuleName );

			if ( !oInstanceData || !oInstanceData.oInstance )
			{
				return _false_;
			}

			if ( oInstanceData.bIsStarted )
			{
				if ( _oUtils.isFunction( oInstanceData.oInstance.onStop ) )
				{
					oInstanceData.oInstance.onStop();
				}
				oInstanceData.bIsStarted = _false_;
			}

			if ( bAndDestroy )
			{
				if ( _oUtils.isFunction( oInstanceData.oInstance.onDestroy ) )
				{
					oInstanceData.oInstance.onDestroy();
				}
				delete _oModulesData[sModuleName];
				return _true_;
			}

			return !oInstanceData.bIsStarted;
		},
		/**
		 * Instantiates a module.
		 * @param {String} sModuleName The module name
		 * @return {Object} The module instance
		 * @throws {Error} If the module has not been defined
		 */
		instantiate : function ( sModuleName )
		{
			var oModuleData = _oModulesData[sModuleName],
				aToolsNames = oModuleData.aToolsNames,
				nToolIndex = aToolsNames.length,
				sToolName,
				aTools = [],
				oInstance;

			if ( !oModuleData )
			{
				Error.report( 'The module "'+sModuleName+'" is not defined!' );
			}

			while ( nToolIndex-- )
			{
				sToolName = aToolsNames[nToolIndex];
				aTools.unshift( TinyCore.Toolbox.request( sToolName ) );
			}

			oInstance = _oUtils.createModuleObject( oModuleData.fpCreator, aTools );

			if ( TinyCore.debugMode )
			{
				oInstance.__tools__ = oInstance.__tools__ || {};
				nToolIndex = aToolsNames.length;
				while ( nToolIndex-- )
				{
					oInstance.__tools__[aToolsNames[nToolIndex]] = aTools[nToolIndex];
				}
			}
			else
			{
				// Catch errors by wrapping all the instance's methods into a try-catch statement.
				_oUtils.forIn( oInstance, function ( instanceProp, sPropName )
				{
					if ( _oUtils.isFunction( instanceProp ) )
					{
						oInstance[sPropName] = _oUtils.tryCatchDecorator( oInstance, instanceProp, 'Error in module "'+sModuleName+'" executing method "'+sPropName+'": ' );
					}
				} );
			}

			return oInstance;
		},
		/**
		 * Returns the data related to all the modules defined, useful for creating an extension to TinyCore.
		 * @return {Object} oModuleData The modules data ; each property is itself an object containing the following properties :
		 * @return {Function} oModuleData.fpCreator The function invoked to create a new module's instance
		 * @return {Object} oModuleData.oInstances The instances of the module
		 */
		getModules : function ()
		{
			return _oModulesData;
		},
		/**
		 * Returns a specified module's instance data.
		 * @param {String} sModuleName
		 * @param {String} sInstanceName Optional
		 * @return {Object} oInstanceData The instance data
		 * @return {Object} oInstanceData.oInstance The instance of the module
		 * @return {Boolean} oInstanceData.bIsStarted Whether the module is started or not
		 * @throws {Error} If the module has not been defined
		 */
		getInstance : function ( sModuleName, sInstanceName )
		{
			var oModuleData = _oModulesData[sModuleName];
			if ( !oModuleData )
			{
				TinyCore.Error.report( 'The module "'+sModuleName+'" is not defined!' );
			}
			if ( typeof sInstanceName === 'undefined' )
			{
				// Return the default module instance.
				sInstanceName = sModuleName;
			}
			return oModuleData.oInstances[sInstanceName];
		}
	};

	// Add TinyCore to the environment.
	oEnv.TinyCore = TinyCore;

	if ( oEnv.define && oEnv.define.amd )
	{
		oEnv.define( 'TinyCore', TinyCore );
	}

	if ( oEnv.module && oEnv.module.exports )
	{
		oEnv.module.exports = TinyCore;
	}
} ( this ) );
