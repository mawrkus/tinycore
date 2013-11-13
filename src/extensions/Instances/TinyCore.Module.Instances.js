/**
 * Multi-instances extension for TinyCore.js
 * @author Mawkus aka Marc Mignonsin (web@sparring-partner.be)
 * @requires TinyCore.js
*/
;( function ( oEnv )
{
	'use strict';

	var TinyCore = oEnv.TinyCore,
		Utils = TinyCore.Utils,
		Module = TinyCore.Module;

	/**
	 * The multi-instances extension.
	 * @type {Object}
	 */
	var _oInstancesExt = {
		/**
		 * Starts a new module instance and calls its "onStart" method with oStartData passed as parameter.
		 * @param {String} sModuleName The module name
		 * @param {String} sInstanceName The instance name
		 * @param {Object} oStartData Data to be passed to the module "onStart" method
		 * @return {Boolean} Whether the instance has been started or not
		 * @throws {Error} If the module has not been defined
		 */
		startInstance : function ( sModuleName, sInstanceName, oStartData )
		{
			var oInstanceData = Module.getInstance( sModuleName, sInstanceName );

			if ( !oInstanceData )
			{
				oInstanceData = Module.getModules()[sModuleName].oInstances[sInstanceName] = {
					oInstance : Module.instanciate( sModuleName )
				};
			}

			if ( !oInstanceData.bIsStarted )
			{
				oInstanceData.oInstance.onStart( oStartData, sInstanceName ); // onStart must be defined in the module.
				oInstanceData.bIsStarted = true;
			}

			return oInstanceData.bIsStarted;
		},
		/**
		 * Stops a module instance by calling its "onStop" method if it exists and unsubscribing from all subscribed topics.
		 * @param {String} sModuleName The module name
		 * @param {String} sInstanceName The instance name
		 * @return {Boolean} Whether the module should also be destroyed or not
		 * @return {Boolean} Whether the instance has been stopped or not
		 * @throws {Error} If the module has not been defined
		 */
		stopInstance : function ( sModuleName, sInstanceName, bAndDestroy )
		{
			var oInstanceData = Module.getInstance( sModuleName, sInstanceName );

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
				delete Module.getModules()[sModuleName].oInstances[sInstanceName];
				return true;
			}

			return !oInstanceData.bIsStarted;
		},
		/**
		 * Redefinition of the original method to start all instances.
		 * @param {String} sModuleName The module name
		 * @param {Object} oStartData Optional, the data to pass to each instance's "onStart" method
		 * @return {Boolean} Whether all instances have been started or not
		 * @throws {Error} If the module has not been defined
		 */
		start : function ( sModuleName, oStartData )
		{
			var oModules = Module.getModules(),
				bAllStarted = true;

			Utils.forEach( oModules[sModuleName].oInstances, function ( oInstance, sInstanceName )
			{
				bAllStarted = bAllStarted && Module.startInstance( sModuleName, sInstanceName, oStartData );
			} );

			return bAllStarted;
		},
		/**
		 * Redefinition of the original method to stop all instances.
		 * @param {String} sModuleName The module name
		 * @return {Boolean} Whether the module should also be destroyed or not
		 * @return {Boolean} Whether all instances have been stopped or not
		 * @throws {Error} If the module has not been defined
		 */
		stop : function ( sModuleName, bAndDestroy )
		{
			var oModules = Module.getModules(),
				bAllStopped = true;

			Utils.forEach( oModules[sModuleName].oInstances, function ( oInstance, sInstanceName )
			{
				bAllStopped = bAllStopped && Module.stopInstance( sModuleName, sInstanceName, bAndDestroy );
			} );

			if ( bAllStopped )
			{
				delete oModules[sModuleName];
			}

			return bAllStopped;
		}
	};

	// Define TinyCore a little bit more.
	Utils.extend( Module, _oInstancesExt );

} ( this ) );
