/**
 * Extended API for TinyCore.js
 * @author Mawkus aka Marc Mignonsin (web@sparring-partner.be)
 * @requires TinyCore.js
*/
;( function ( oEnv )
{
	'use strict';

	if ( !oEnv.TinyCore )
	{
		throw new Error( 'Cannot extend TinyCore\'s API: TinyCore seems to be missing!' );
	}

	/* ------------------------------------ HELPERS ------------------------------------ */

	// Improve minification
	var _true_ = true, _false_ = false, _null_ = null;

	/**
	 * ...
	 * @type {Function}
	 * @param {Object} oObject
	 * @param {String} sPropName
	 * @return {String}
	*/
	var _fpHasOwnProperty = function ( oObject, sPropName )
	{
		return oObject.hasOwnProperty( sPropName );
	};

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
	 * The core extended API
	 * @type {Object}
	 */
	var _oTinyCoreExt = {
		/**
		 * Current version
		 * @type {String}
		 */
		extVersion : '0.1.0',

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
		 * @param {Array|Object} oMixed Optional, an array containing the modules names to start or an object that will be passed as a parameter to each start method
		 * @param {Object} oStartData Optional, the data to be passed to each module's start method
		 */
		startAll : function ( oMixed, oStartData )
		{
			var nIndex = 0,
				nModulesCount = 0,
				sCurrentModuleName = '',
				oModules = _null_;

			if ( _fpIsClass( oMixed, 'Array' ) )
			{
				oStartData = oStartData || {};

				for ( nModulesCount = oMixed.length ; nIndex < nModulesCount; nIndex++ )
				{
					sCurrentModuleName = oMixed[nIndex];
					this.start( sCurrentModuleName, oStartData[sCurrentModuleName] );
				}
			}
			else
			{
				oStartData = oMixed || {};
				oModules = this.getModules();

				for ( sCurrentModuleName in oModules )
				{
					if ( _fpHasOwnProperty( oModules, sCurrentModuleName ) )
					{
						this.start( sCurrentModuleName, oStartData[sCurrentModuleName] );
					}
				}
			}	
		},

		/**
		 * Stops a selected set of modules or all modules
		 * If the first parameter is not an array, then all modules will be stopped 
		 * @param {Array} aModulesNames Optional, The modules names to stop
		 */
		stopAll : function ( aModulesNames )
		{
			var nIndex = 0,
				nModulesCount = 0,
				sCurrentModuleName = '',
				oModules = _null_;

			if ( _fpIsClass( aModulesNames, 'Array' ) )
			{
				for ( nModulesCount = aModulesNames.length ; nIndex < nModulesCount; nIndex++ )
				{
					this.stop( aModulesNames[nIndex] );
				}
			}
			else
			{
				oModules = this.getModules();

				for ( sCurrentModuleName in oModules )
				{
					if ( _fpHasOwnProperty( oModules, sCurrentModuleName ) )
					{
						this.stop( sCurrentModuleName );
					}
				}
			}
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
			var nIndex = 0,
				nModulesCount = 0,
				sCurrentModuleName = '',
				oModules = _null_;

			if ( _fpIsClass( aModulesNames, 'Array' ) )
			{
				for ( nModulesCount = aModulesNames.length ; nIndex < nModulesCount; nIndex++ )
				{
					this.destroy( aModulesNames[nIndex] );
				}
			}
			else
			{
				oModules = this.getModules();

				for ( sCurrentModuleName in oModules )
				{
					if ( _fpHasOwnProperty( oModules, sCurrentModuleName ) )
					{
						this.destroy( sCurrentModuleName );
					}
				}
			}
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
		},

		/** 
		 * Redefines the error handler to use DOM if the console does not exist
		 * @type {Object}
		 */
		ErrorHandler : {
			/**
			 * * Logs an error message using the console if it exists, or DOM if not
			 * @param  {String} sMsg
			 */
			log : ( function ( oEnv, oConsole, oDoc )
			{
				var oLog = _null_;

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
		}
	};

	// Add the new methods to TinyCore.
	oEnv.TinyCore.extend( _oTinyCoreExt );
} ( this ) );