/**
 * Modules management for TinyCore.js
 * @author Mawrkus (web@sparring-partner.be)
*/
;( function ( oEnv )
{
	'use strict';

	var TinyCore = oEnv.TinyCore,
		Utils = TinyCore.Utils,
		Toolbox = TinyCore.Toolbox;

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
	var _oModule = {
		/**
		 * Defines a new module.
		 * @param {String} sModuleName The module name
		 * @param {Array} aToolsNames An array of tools names, that will be requested to the Toolbox and passed as arguments of fpCreator
		 * @param {Function} fpCreator The function that creates and returns a module instance
		 * @return {String} The module name, if it has been successfuly defined, or false if not.
		 */
		define : function ( sModuleName, aToolsNames, fpCreator )
		{
			if ( _oModulesData[sModuleName] || !Utils.isFunction( fpCreator ) )
			{
				return false;
			}

			_oModulesData[sModuleName] = {
				fpCreator	: fpCreator,
				oInstances	: {},
				aToolsNames : aToolsNames,
				aTools : []
			};

			return true;
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
			// We use the module name as the default instance name.
			var oInstanceData = _oModule.getInstance( sModuleName, sModuleName );

			if ( !oInstanceData )
			{
				oInstanceData = _oModulesData[sModuleName].oInstances[sModuleName] = {
					oInstance : _oModule.instanciate( sModuleName )
				};
			}

			if ( !oInstanceData.bIsStarted )
			{
				oInstanceData.oInstance.onStart( oStartData ); // onStart must be defined in the module.
				oInstanceData.bIsStarted = true;
			}

			return oInstanceData.bIsStarted;
		},
		/**
		 * Stops a module instance by calling its "onStop" method (if it exists) and by unsubscribing from all the subscribed topics.
		 * @param {String} sModuleName The module name
		 * @return {Boolean} Whether the module should also be destroyed or not
		 * @return {Boolean} Whether the module has been stopped or not
		 * @throws {Error} If the module has not been defined
		 */
		stop : function ( sModuleName, bAndDestroy )
		{
			// We use the module name as the default instance name.
			var oInstanceData = _oModule.getInstance( sModuleName, sModuleName );

			if ( !oInstanceData || !oInstanceData.oInstance )
			{
				return false;
			}

			if ( oInstanceData.bIsStarted )
			{
				if ( Utils.isFunction( oInstanceData.oInstance.onStop ) )
				{
					oInstanceData.oInstance.onStop();
				}
				oInstanceData.bIsStarted = false;
			}

			if ( bAndDestroy )
			{
				if ( Utils.isFunction( oInstanceData.oInstance.onDestroy ) )
				{
					oInstanceData.oInstance.onDestroy();
				}
				delete _oModulesData[sModuleName];
				return true;
			}

			return !oInstanceData.bIsStarted;
		},
		/**
		 * Instanciates a module.
		 * @param {String} sModuleName The module name
		 * @return {Object} The module instance
		 * @throws {Error} If the module has not been defined
		 */
		instanciate : function ( sModuleName )
		{
			var oModuleData = _oModulesData[sModuleName],
				aToolsNames = oModuleData.aToolsNames,
				nToolIndex = aToolsNames.length,
				sToolName,
				oInstance;

			if ( !oModuleData )
			{
				throw new Error( 'The module "'+sModuleName+'" is not defined!' );
			}

			// Lazy requests of the tools.
			if ( nToolIndex && !oModuleData.aTools.length )
			{
				while ( nToolIndex-- )
				{
					sToolName = aToolsNames[nToolIndex];
					oModuleData.aTools.unshift( Toolbox.request( sToolName ) || sToolName );
				}
			}

			oInstance = oModuleData.fpCreator.apply( null, oModuleData.aTools );

			if ( !TinyCore.debugMode )
			{
				// Decorate the instance's methods by wrapping them into a try-catch statement.
				Utils.forEach( oInstance, function ( instanceProp, sPropName )
				{
					if ( Utils.isFunction( instanceProp ) )
					{
						oInstance[sPropName] = Utils.tryCatchDecorator( oInstance, instanceProp, 'Error in module "'+sModuleName+'" executing method "'+sPropName+'": ' );
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
		 * @param {String} sInstanceName
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
				throw new Error( 'The module "'+sModuleName+'" is not defined!' );
			}
			return oModuleData.oInstances[sInstanceName];
		}
	};

	// Define TinyCore a little bit more.
	TinyCore.Module = _oModule;

} ( this ) );
