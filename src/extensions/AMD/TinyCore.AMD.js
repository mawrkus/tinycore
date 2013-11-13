/**
 * AMD extension for TinyCore.js
 * Load modules asynchronously using require.js and starts them
 * @author Mawkus aka Marc Mignonsin (web@sparring-partner.be)
 * @requires TinyCore.js
 * @requires require.js version >= 2.1.4
*/
( function ( oEnv )
{
	'use strict';

	var TinyCore = oEnv.TinyCore,
		Utils = TinyCore.Utils,
		Module = TinyCore.Module,
		Toolbox = TinyCore.Toolbox;

	if ( !oEnv.require || !oEnv.define )
	{
		throw new Error( 'Cannot add AMD extension to TinyCore: require.js seems to be missing!' );
	}

	/**
	 * The AMD extension.
	 * @type {Object}
	 */
	var _oAMDExt = {
		/**
		 * Configures require.
		 * @param {Object} oSettings The options of configuration, see http://requirejs.org/docs/api.html#config
		 */
		config : function ( oSettings )
		{
			oEnv.require.config( oSettings );
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
		 * @param {Array} aResourcesNames
		 * @param {Function} fpCallback The function to call when all modules are loaded, it receives tha array of modules names
		 */
		require : function ( aResourcesNames, fpCallback )
		{
			oEnv.require( aResourcesNames, fpCallback );
		},
		/**
		 * Loads asynchronously modules and starts them.
		 * @param {Object} oModulesData E.g. { 'm1' : { startData:{} }, ... }
		 * @param {Function} fpCallback The function to call when all modules are loaded and started, it receives tha array of modules names
		 */
		requireAndStart : function ( oModulesData, fpCallback )
		{
			var aModules = [];

			Utils.forEach( oModulesData, function ( oModuleData, sModuleName )
			{
				aModules.push( sModuleName );
			} );

			_oAMDExt.require( aModules, function ()
			{
				Utils.forEach( oModulesData, function ( oModuleData, sModuleName )
				{
					Module.start( sModuleName, oModuleData.startData );
				} );

				if ( fpCallback )
				{
					fpCallback();
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
