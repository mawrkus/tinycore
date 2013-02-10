/**
 * TinyCore.js
 * A tiny yet extensible JS modular architecture.
 * @author Mawkus aka Marc Mignonsin (web@sparring-partner.be)
*/
;( function ( oEnv )
{
	'use strict';

	/* ------------------------------------ HELPERS ------------------------------------ */

	// Improve minification
	var _true_ = true, _false_ = false, _null_ = null;

	/**
	 * A wrapper over hasOwnProperty
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
	 * A good way to determine the class of an object
	 * @type {Function}
	 * @param {Mixed} oMixed
	 * @return {Boolean}
	*/
	var _fpIsClass = function ( oMixed, sClassName )
	{
		return Object.prototype.toString.call( oMixed ) === '[object '+sClassName+']';
	};

	/**
	 * Merges recursively two objects by adding the source object properties to the destination object
	 * @type {Function}
	 * @param {Object} oDest The destination object
	 * @param {Object} oSrc The source object
	 * @return {Object}
	*/
	var _fpMerge = function ( oDest, oSrc )
	{
		var oProp = _null_,
			sPropName = '';

		oDest = oDest || {};

		for ( sPropName in oSrc )
		{
			if ( _fpHasOwnProperty( oSrc, sPropName ) )
			{
				oProp = oSrc[sPropName];

				if ( _fpIsClass( oProp, 'Object' ) )
				{
					oProp = _fpMerge( oDest[sPropName], oProp );
				}

				oDest[sPropName] = oProp;
			}
		}

		return oDest;
	};

	/* ------------------------------------ ERROR HANDLER ------------------------------------ */

	/**
	 * * The error handler
	 * @type  {Object}
	 */
	var _oErrorHandler = {
		/**
		 * * Logs an error message
		 * @param  {String} sMsg
		 */
		log : function ( sMsg )
		{
			oEnv.console && oEnv.console.error( sMsg );
		}
	};

	/* ------------------------------------ SANDBOX ------------------------------------ */

	/**
	 * The sandbox factory
	 * @type {Object}
	 */
	var _oSandBox = ( function ()
	{
		/**
		 * The registered sandboxes
		 * @type {Object}
		 */
		var _oSandBoxes = {};

		/**
		 * The numbers of sandboxes created
		 * @type {Number}
		 */
		var _nSandBoxesCount = 0;

		/**
		 * The events data, e.g. :
		 * {
		 * 	'graph:color:change' : { 0:func0, 3:func3 },
		 *  'filter:date:change' : { 1:func1, 2:func2 ,3:func3 }
		 * }
		 * Note : 0, 1, 2, 3 are the IDs of the subscribers and func0, func1, func2, func3, the related handlers
		 * @type {Object}
		 */
		var _oEventsData = {};

		/**
		 * The subscribers lookup data, given a subscriber's ID, this will allow us to retrieve easily all the events subscribed, e.g. :
		 * {
		 * 	0 : [ 'graph:color:change' ],
		 * 	1 : [ 'filter:date:change' ],
		 * 	2 : [ 'filter:date:change' ],
		* 	3 : [ 'graph:color:change', 'filter:date:change' ],
		 * }
		 * Note : 0, 1, 2, 3 are the IDs of the subscribers
		 * @type {Object}
		 */
		var _oSubsLookupData = {};

		/**
		 * Creates a new sandbox prototype
		 * param {Number} nID The prototype ID
		 * @return {Object} The new sandbox prototype created
		 */
		var _fpCreatePrototype = function ( nID )
		{
			var sSubID = nID;

			return {
				/**
				 * Subscribes to one or more events
				 * @param {String|Array} aEventsTypes A string or an array of events to subscribe to
				 * @param {Function} fpHandler The event handler
				 */
				subscribe : function ( aEventsTypes, fpHandler )
				{
					var nEventsCount = 0,
						nIndex = 0,
						sEventType = '';

					if ( _fpIsClass( fpHandler, 'Function' ) )
					{
						aEventsTypes = _fpIsClass( aEventsTypes, 'Array' ) ? aEventsTypes : [aEventsTypes];

						for ( nEventsCount = aEventsTypes.length ; nIndex < nEventsCount; nIndex++ )
						{
							sEventType = aEventsTypes[nIndex];
							_oEventsData[sEventType] = _oEventsData[sEventType] || {};

							if ( !_oEventsData[sEventType][sSubID] )
							{
								_oEventsData[sEventType][sSubID] = fpHandler;
								_oSubsLookupData[sSubID] = _oSubsLookupData[sSubID] || [];
								_oSubsLookupData[sSubID].push( sEventType );
							}
						}
					}
				},

				/**
				 * Publishes an event
				 * @param {String} sEventType
				 * @param {Object} oEventData
				 */
				publish : function ( sEventType, oData )
				{
					var oSubs = _oEventsData[sEventType];

					if ( oSubs )
					{
						// Don't block the main thread
						oEnv.setTimeout( function ()
						{
							var sID = '';

							for ( sID in oSubs )
							{
								if ( _fpHasOwnProperty( oSubs, sID ) )
								{
									oSubs[sID]( { type : sEventType, data : oData } );
								}
							}
						}, 0 );
					}
				},

				/**
				 * Unsubscribes from one or more events
				 * @param {String|Array} aEventsTypes A string or an array of events to unSubscribe from
				 */
				unSubscribe : function ( aEventsTypes )
				{
					var aEventsTypes = _fpIsClass( aEventsTypes, 'Array' ) ? aEventsTypes : [aEventsTypes],
						nEventsCount = aEventsTypes.length,
						oSubs = _null_;

					while ( nEventsCount-- )
					{
						oSubs = _oEventsData[aEventsTypes[nEventsCount]]
						if ( oSubs && oSubs[sSubID] )
						{
							delete oSubs[sSubID];
						}
					}
				},

				/**
				 * Unsubscribes from all subscribed events
				 */
				unSubscribeAll : function ()
				{
					if ( _oSubsLookupData[sSubID] )
					{
						this.unSubscribe( _oSubsLookupData[sSubID] );
					}
				}
			}
		};

		return {
			/**
			 * Creates a new sandbox
			 * @param {String} sType Optional, the sandbox type
			 * @return {Object} The new sandbox
			 */
			create : function ( sType )
			{
				return _fpMerge( _fpCreatePrototype( ++_nSandBoxesCount ), _oSandBoxes[sType] || {} );
			},

			/**
			 * Registers a new sandbox
			 * @param {String} sType Optional, the sandbox type
			 * @param {Object} oNewSandBox The new sandbox
			 * @return {Boolean} Whether the sandbox has been successfully registered or not
			 */
			register : function ( sType, oNewSandBox )
			{
				if ( !_oSandBoxes[sType] )
				{
					_oSandBoxes[sType] = oNewSandBox;
					return _true_;
				}
				return _false_;
			}
		};
	} () );

	/* ------------------------------------ CORE ------------------------------------ */

	/**
	 * Modules data
	 * @type {Object}
	 * @type {Function} fpCreator The function invoked to create a new module's instance
	 * @type {String} sSandBoxType The type of sandbox used
	 * @type {Object} oInstance The instance of the module or null if the module has not been started
	 * @type {Boolean} bIsStarted Whether the module is started or not
	 */
	var _oModules = {};

	/**
	 * Checks if a module has been registered or not and throws an exception accordingly
	 * @type {Function}
	 * @param {String} sModuleName
	 * @throws {Error}
	 */
	var _fpCheckModuleRegistration = function ( sModuleName )
	{
		if ( !_oModules[sModuleName] )
		{
			throw new Error( 'Module "'+sModuleName+'" is not registered!' );
		}
	};

	/**
	 * Decorates a module's instance methods by wrapping them into a try-catch statement
	 * @type {Function}
	 * @param  {String} sModuleName The module name
	 * @param  {Object} oInstance The module's instance
	 */
	var _fpDecorateInstanceMethods = function ( sModuleName, oInstance )
	{
		var sPropName = '',
			oProp = _null_;

		for ( sPropName in oInstance )
		{
			if ( _fpHasOwnProperty( oInstance, sPropName ) )
			{
				oProp = oInstance[sPropName];

				if ( _fpIsClass( oProp, 'Function' ) )
				{
					// Decorate the method
					oInstance[sPropName] = ( function ( sPropName, oProp )
					{
						return function ()
						{
							try
							{
								oProp.apply( oInstance, Array.prototype.slice.call( arguments, 0 ) );
							}
							catch ( eError )
							{
								TinyCore.ErrorHandler.log( 'Error in module "'+sModuleName+'" executing method "'+sPropName+'": '+eError.message );
							}
						}
					} ( sPropName, oProp ) );
				}
				else if ( _fpIsClass( oProp, 'Object' ) )
				{
					// Deep decoration
					_fpDecorateInstanceMethods( sModuleName, oProp );
				}
			}
		}
	};

	/**
	 * Creates a new module instance
	 * @type {Function}
	 * @param  {String} sModuleName The module name
	 * @return {Object} The new module instance
	 */
	var _fpCreateModuleInstance = function ( sModuleName )
	{
		var oSandBox = _oSandBox.create( _oModules[sModuleName].sSandBoxType ),
			oInstance = _oModules[sModuleName].fpCreator( oSandBox );

		if ( !TinyCore.debugMode )
		{
			_fpDecorateInstanceMethods( sModuleName, oInstance );
		}

		oInstance.__sandbox__ = oSandBox;

		return oInstance;
	};

	/**
	 * The core
	 * @type {Object}
	 */
	var _oTinyCore = {
		/**
		 * Current version
		 * @type {String}
		 */
		version : '0.1.0',

		/**
		 * Debug mode, if true, error in modules methods will not be caught
		 * if false, errors will be caught and logged
		 * @type {Boolean}
		 */
		debugMode : _false_,

		/**
		 * Allows TinyCore to be extended by merging recursively an object into it
		 * @param {Object} oExtension The object which properties will be added to TinyCore
		*/
		extend : function ( oExtension )
		{
			_fpMerge( this, oExtension );
		},

		/**
		 * Registers a new module
		 * @param {String} sModuleName The module name
		 * @param {Function} fpCreator The function that creates and returns a module instance
		 * @param {String} sSandBoxType Optional, the type of sandbox to provide to the module's instance
		 * @return {Boolean} Whether the module has been successfully registered or not
		 */
		register : function ( sModuleName, fpCreator, sSandBoxType )
		{
			if ( !_oModules[sModuleName] )
			{
				_oModules[sModuleName] = {
					fpCreator	: fpCreator,
					sSandBoxType : sSandBoxType || '',
					oInstance	: _null_,
					bIsStarted	: _false_
				};
				return _true_;
			}
			return _false_;
		},

		/**
		 * Starts a module by creating a new module instance and calling its "onStart" method with oStartData passed as parameter
		 * @param {String} sModuleName The module name
		 * @param {Object} oStartData Data to be passed to the module "onStart" method
		 */
		start : function ( sModuleName, oStartData )
		{
			_fpCheckModuleRegistration( sModuleName );

			if ( !_oModules[sModuleName].bIsStarted )
			{
				if ( !_oModules[sModuleName].oInstance )
				{
					_oModules[sModuleName].oInstance = this.instanciate( sModuleName );
				}
				_oModules[sModuleName].oInstance.onStart( oStartData ); // onStart must be defined in the module.
				_oModules[sModuleName].bIsStarted = _true_;
			}
		},

		/**
		 * Stops a module by calling its "onStop" method
		 * @param {String} sModuleName The module name
		 */
		stop : function ( sModuleName )
		{
			_fpCheckModuleRegistration( sModuleName );

			if ( _oModules[sModuleName].bIsStarted && _oModules[sModuleName].oInstance )
			{
				if ( _fpIsClass( _oModules[sModuleName].oInstance.onStop, 'Function' ) )
				{
					_oModules[sModuleName].oInstance.onStop();
				}
				_oModules[sModuleName].oInstance.__sandbox__.unSubscribeAll();
				_oModules[sModuleName].bIsStarted = _false_;
			}
		},

		/**
		 * Instanciates a module, the purpose of this method is mainly to test a module
		 * @param {String} sModuleName The module name
		 * @return {Object} The module instance
		 */
		instanciate : function ( sModuleName )
		{
			_fpCheckModuleRegistration( sModuleName );

			return _fpCreateModuleInstance( sModuleName );
		},

		/**
		 * Returns the data related to all registered modules
		 * Allows the extensions to have access to the modules data
		 * @return {Object} The modules data ; each property is itself an object containing the following properties : 
		 * @return {Function} fpCreator The function invoked to create a new module's instance
		 * @return {String} sSandBoxType The type of sandbox used
		 * @return {Object} oInstance The instance of the module or null if the module has not been started
		 * @return {Boolean} bIsStarted Whether the module is started or not
		 */
		getModules : function ()
		{
			return _oModules;
		},

		/** 
		 * The sandbox factory
		 * @type {Object}
		 */
		SandBox : _oSandBox,

		/** 
		 * The error handler
		 * @type {Object}
		 */
		ErrorHandler : _oErrorHandler
	};

	// Add TinyCore to the environment.
	oEnv.TinyCore = _oTinyCore;

	if ( oEnv.define )
	{
		// Define an AMD module.
		define( 'TinyCore',  _oTinyCore );
	}
} ( this ) );