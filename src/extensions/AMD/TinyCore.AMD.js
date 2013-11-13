/**
 * AMD extension for TinyCore.js
 * Load modules asynchronously using require.js and starts them
 * @author mawrkus (web@sparring-partner.be)
 * @requires TinyCore.js
 * @requires require.js version >= 2.1.4
*/
( function ( oEnv )
{
	'use strict';

	var TinyCore = oEnv.TinyCore,
		Utils = TinyCore.Utils,
		Module = TinyCore.Module;

	if ( !oEnv.require || !oEnv.define )
	{
		throw new Error( 'Cannot add AMD extension to TinyCore: require.js seems to be missing!' );
	}

	/* Private. */

	/**
	 * The default configuration for require.js.
	 * @type {Object}
	 */
	var DEFAULT_REQUIRE_CONFIG = {
			baseUrl : 'modules'
		},
		/**
		 * The current configuration.
		 * @type {Object}
		 */
		_oConfig = {
			require : Utils.extend( {}, DEFAULT_REQUIRE_CONFIG )
		};

	/**
	 * The AMD extension.
	 * @type {Object}
	 */
	var _oAMDExt = {
		/**
		 * Configures the extension, both require.js and the DOM boot loader.
		 * @param {Object} oSettings Optional, the settings, see http://requirejs.org/docs/api.html#config for require.js
		 * @return {Object} The current configuration, if no parameter has been provided
		 */
		config : function ( oSettings )
		{
			if ( typeof oSettings === 'undefined' )
			{
				return _oConfig;
			}
			Utils.extend( _oConfig, oSettings );
			oEnv.require.config( _oConfig.require );
		},
		/**
		* Sets the global error handler.
		* @param {Function} fpErrorHandler
		*/
		setErrorHandler : function ( fpErrorHandler )
		{
			oEnv.require.onError = fpErrorHandler;
		},
		/**
		 * Defines a module.
		 * @param {String} sModuleName
		 * @param {Array} aDependencies
		 * @param {Function} fpCreator
		 */
		define : function ( sModuleName, aDependencies, fpCreator )
		{
			oEnv.define( sModuleName, aDependencies, function ()
			{
				var aDepsBaseNames = [],
					nIndex = aDependencies.length;

				while ( nIndex-- )
				{
					aDepsBaseNames.unshift( aDependencies[nIndex].split( '/' ).pop() );
				}

				Module.define( sModuleName, aDepsBaseNames, fpCreator );
			} );
		},
		/**
		 * Loads asynchronously modules/scripts.
		 * @param {Array|String} aResourcesNames
		 * @param {Function} fpCallback The function to call when all modules are loaded, it receives the array of modules names
		 */
		require : function ( aResourcesNames, fpCallback )
		{
			oEnv.require( aResourcesNames, fpCallback );
		},
		/**
		 * Loads asynchronously modules and starts them.
		 * @param {Array|String|Object} aModulesData E.g. [ { name : 'm1', startData:{} }, { name : 'm2', startData:{} }, ... ]
		 * @param {Function} fpCallback Optional, the function to call when all modules are loaded and started, it receives the array of modules names
		 */
		requireAndStart : function ( aModulesData, fpCallback )
		{
			var aModulesNames = [];

			if ( !Utils.isArray( aModulesData ) )
			{
				aModulesData = [aModulesData];
			}

			aModulesData.forEach( function ( data, nIndex )
			{
				if ( typeof data === 'string' )
				{
					aModulesData[nIndex] = data = { name : data, startData : {} };
				}
				aModulesNames.push( data.name );
			} );

			_oAMDExt.require( aModulesNames, function ()
			{
				aModulesData.forEach( function ( oModuleData )
				{
					Module.start( oModuleData.name, oModuleData.startData );
				} );
				if ( fpCallback )
				{
					fpCallback( aModulesData );
				}
			} );
		}
	};

	// Install the default global error handler
   _oAMDExt.setErrorHandler( function ( eError )
	{
		TinyCore.Error.log( 'Error loading module(s) "'+eError.requireModules+'": '+eError.message );
	} );

	// Define TinyCore a little bit more.
	TinyCore.AMD = _oAMDExt;

} ( this ) );
