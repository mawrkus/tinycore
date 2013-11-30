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
