/**
 * Extended modules manager for TinyCore.js
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

	/* ------------------------------------ HELPERS ------------------------------------ */

	// Helps minification
	var _true_ = true, _false_ = false, _null_ = null;

	/**
	 * ...
	 * @type {Function}
	 * @param {Mixed} oMixed
	 * @return {Boolean}
	*/
	var _fpIsClass = function ( oMixed, sClassName )
	{
		return Object.prototype.toString.call( oMixed ) === '[object '+sClassName+']';
	};

	/**
	 * Runs through all the properties of an object, applying a callback function on each of them
	 * @type {Function}
	 * @param {Object} oObject
	 * @param {Function} fpCallback
	 */
	var _fpForEach = function ( oObject, fpCallback )
	{
		var sProperty;

		for ( sProperty in oObject )
		{
			if ( oObject.hasOwnProperty( sProperty ) )
			{
				fpCallback( oObject[sProperty], sProperty );
			}
		}
	};

	/* ------------------------------------ MODULES ------------------------------------ */

	/**
	 * The extended modules manager
	 * @type {Object}
	 */
	var _oExtModulesManager = ( function ( Module )
	{
		/**
		 * Helper, applies a TinyCore method to some modules or to all modules by default
		 * @param  {String} sMethodName
		 * @param  {Array|Object} aModulesNamesOrExtraParam An array of module names or an object containing some extra parameter.
		 * @param  {Object} oExtraParam Optional, some extra parameter, used only if aModulesNamesOrExtraParam is an array. 
		 */
		var _fpApplyToAll = function ( sMethodName, aModulesNamesOrExtraParam, oExtraParam )
		{
			var nIndex = 0,
				fpMethod = Module[sMethodName],
				nModulesCount,
				sModuleName;

			if ( _fpIsClass( aModulesNamesOrExtraParam, 'Array' ) )
			{
				// ( sMethodName, aModulesNamesOrExtraParam, oExtraParam )
				oExtraParam = oExtraParam || {};

				for ( nModulesCount = aModulesNamesOrExtraParam.length ; nIndex < nModulesCount; nIndex++ )
				{
					sModuleName = aModulesNamesOrExtraParam[nIndex];
					fpMethod.call( Module, sModuleName, oExtraParam[sModuleName] );
				}
			}
			else
			{
				// ( sMethodName, oExtraParam )
				oExtraParam = aModulesNamesOrExtraParam || {};

				_fpForEach( Module.getModules(), function ( oModule, sModuleName )
				{
					fpMethod.call( Module, sModuleName, oExtraParam[sModuleName] );
				} );
			}
		};

		// The public API
		return {
			/**
			 * Instanciates a module and add automatic topics subscriptions if the "topics" property is present
			 * @param {String} sModuleName The module name
			 * @return {Object} The module instance
			 */
			instanciate : ( function ( fpOrigInstanciate )
			{
				return function ( sModuleName )
				{
					var oInstance = fpOrigInstanciate( sModuleName );
					
					if ( oInstance.topics )
					{
						_fpForEach( oInstance.topics, function ( fpHandler, sTopic )
						{
							oInstance.__sandbox__.subscribe( sTopic, fpHandler, oInstance );
						} );
					}

					return oInstance;
				};
			} ( Module.instanciate ) ),

			/**
			 * Returns true if a module is started, false if not
			 * @param {String} sModuleName The module name
			 * @param {Boolean}
			 */
			isStarted : function ( sModuleName )
			{
				var oModule = this.getModules()[sModuleName];
				return oModule && oModule.bIsStarted;
			},

			/**
			 * Starts a selected set of modules or all modules
			 * If the first parameter is not an array, then all modules will be started 
			 * @param {Array|Object} aModulesNames Optional, an array containing the modules names to start or an object containing the start data for each module
			 * @param {Object} oStartData Optional, the object containing the start data for each module
			 */
			startAll : function ( aModulesNamesOrStartData, oOptionalStartData )
			{
				_fpApplyToAll( 'start', aModulesNamesOrStartData, oOptionalStartData );
			},

			/**
			 * Stops a selected set of modules or all modules
			 * If the first parameter is not an array, then all modules will be stopped 
			 * @param {Array} aModulesNames Optional, The modules names to stop
			 */
			stopAll : function ( aModulesNames )
			{
				_fpApplyToAll( 'stop', aModulesNames );
			},

			/**
			 * Destroys one or more registered modules, the module will first be stopped
			 * @param {String} sModuleName
			 */
			destroy : function ( sModuleName )
			{
				var oModules = this.getModules(),
					oInstance = oModules[sModuleName].oInstance;

				this.stop( sModuleName );

				if ( oInstance && _fpIsClass( oInstance.onDestroy, 'Function' ) )
				{
					oInstance.onDestroy();
				}

				delete oModules[sModuleName];
			},

			/**
			 * Destroys a selected set of modules or all modules
			 * If the first parameter is not an array, then all modules will be unregistered 
			 * @param {Array} aModulesNames Optional, The modules names to unregister
			 */
			destroyAll : function ( aModulesNames )
			{
				_fpApplyToAll( 'destroy', aModulesNames );
			},

			/**
			 * Registers and starts a new module
			 * @param {String} sModuleName The module name
			 * @param {Function} fpCreator The function that creates and returns a module instance
			 * @return {Boolean} Whether the module has been successfully registered and started or not
			 * @param {String} sSandBoxType Optional, the type of sandbox to provide to the module's instance
			 */
			registerAndStart : function ( sModuleName, fpCreator, sSandBoxType )
			{
				if ( this.register( sModuleName, fpCreator, sSandBoxType ) )
				{
					this.start( sModuleName, _null_ );
					return _true_;
				}
				return _false_;
			}
		};	
	} ( TinyCore.Module ) );

	/* ------------------------------------ CORE ------------------------------------ */

	// Extend TinyCore
	TinyCore.extend( { Module : _oExtModulesManager } );
} ( this ) );