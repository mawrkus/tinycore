/**
 * AMD extension for TinyCore.js
 * Load and register modules asynchronously using require.js
 * @author Mawkus aka Marc Mignonsin (web@sparring-partner.be)
 * @requires require.js version >= 2.1.4
*/
( function ( oEnv )
{
	'use strict';

	var TinyCore = oEnv.TinyCore,
		Module = TinyCore.Module,
		require = oEnv.require,
		define = oEnv.define;

	if ( !TinyCore )
	{
		throw new Error( 'Cannot add AMD extension to TinyCore: TinyCore seems to be missing!' );
	}
	if ( !require || !define )
	{
		throw new Error( 'Cannot add AMD extension to TinyCore: require.js seems to be missing!' );
	}

	/* ------------------------------------ AMD ------------------------------------ */

	/**
	 * The extension
	 * @type {Object}
	 */
	var _oAMD = {
		/**
		 * Current version
		 * @type {String}
		 */
		version : '0.2.0',

		/**
		 * Configures the loading
		 * @param {Object} oSettings The options of configuration, see http://requirejs.org/docs/api.html#config
		 */
		config : function ( oSettings )
		{
			require.config( oSettings );
		},

		/**
		 * Loads and registers asynchronously modules using require.js and Asynchronous Module Definition
		 * @param {Array} aModulesName
		 * @param {Function} fpCallback The function to call when all modules are registered
		 */
		register : function ( aModulesNames, fpCallback )
		{
			require( aModulesNames, function ()
			{
				// We receive all the creator functions as arguments
				var aModulesCreators = Array.prototype.slice.call( arguments ),
					nModulesCount = aModulesCreators.length,
					nModuleIndex = 0,
					sModuleName;

				for ( ; nModuleIndex < nModulesCount; nModuleIndex++ )
				{
					sModuleName = aModulesNames[nModuleIndex];
					Module.register( sModuleName, aModulesCreators[nModuleIndex] );
				};

				if ( fpCallback )
				{
					fpCallback.call( TinyCore );
				}
			} );
		},

		/**
		 * Loads, registers and starts modules using require.js
		 * @param {Array} aModulesNames
		 * @param {Object} oModulesStartData A data object where each key is a module name and each value value the related start data, e. g. :
		 * { 
		 * 		'module1' : { containerID : 'sidebar' },
		 * 		'module2' : { start : new Date(), count : 2 },
		 * 		'module3'
		 * 	} 
		 * @param {Function} fpCallback The function to call when all modules are started
		 */
		registerAndStart : function ( aModulesNames, oModulesStartData, fpCallback )
		{
			var sModuleName;

			this.register( aModulesNames, function ()
			{
				var nModulesCount = aModulesNames.length,
					nModuleIndex = 0;

				for ( ; nModuleIndex < nModulesCount; nModuleIndex++ )
				{
					sModuleName = aModulesNames[nModuleIndex];
					Module.start( sModuleName, oModulesStartData[sModuleName] );
				};

				if ( fpCallback )
				{
					fpCallback.call( TinyCore );
				}
			} );
		},

		/**
		 * Sets the global error handler
		 * @param {Function} fpErrorHandler
		 */
        setErrorHandler : function ( fpErrorHandler )
        {
            require.onError = fpErrorHandler;
        }
	};

	// Install the default global error handler
   _oAMD.setErrorHandler( function ( eError )
    {
        TinyCore.ErrorHandler.log( 'Error loading module(s) "'+eError.requireModules+'": '+eError.message );	
    } );

	// Add the extension to TinyCore
	TinyCore.extend( { AMD : _oAMD } );
} ( this ) );