/**
 * TinyCore.js
 * A tiny yet extensible JS modular architecture.
 * @author Mawkus aka Marc Mignonsin (web@sparring-partner.be)
*/
;( function ( oEnv )
{
	'use strict';

	/* ------------------------------------ HELPERS ------------------------------------ */

	// Helps minification
	var _true_ = true, _false_ = false, _null_ = null;

	/**
	 * Determines the class of an object
	 * @type {Function}
	 * @param {Mixed} oMixed
	 * @return {Boolean}
	*/
	function _fpIsClass ( oMixed, sClassName )
	{
		return Object.prototype.toString.call( oMixed ) === '[object '+sClassName+']';
	};

	/**
	 * Determine if the parameter is a function
	 * @type {Function}
	 * @param {Mixed} oMixed
	 * @return {Boolean}
	*/
	function _fpIsFunction ( oMixed )
	{
		return _fpIsClass( oMixed, 'Function' );
	};

	/**
	 * Runs through all the properties of an object, applying a callback function on each of them
	 * @type {Function}
	 * @param {Object} oObject
	 * @param {Function} fpCallback
	 */
	function _fpForEach ( oObject, fpCallback )
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

	/**
	 * Merges recursively two objects by adding the source object properties to the destination object
	 * @type {Function}
	 * @param {Object} oDest The destination object
	 * @param {Object} oSrc The source object
	 * @return {Object}
	*/
	
	function _fpMerge ( oDest, oSrc )
	{
		oDest = oDest || {};

		_fpForEach( oSrc, function ( oSrcProp, sSrcPropName )
		{
			if ( _fpIsClass( oSrcProp, 'Object' ) )
			{
				oSrcProp = _fpMerge( oDest[sSrcPropName], oSrcProp );
			}

			oDest[sSrcPropName] = oSrcProp;
		} );

		return oDest;
	};

	/**
	 * Converts an array-like object to an actual array
	 * @type {Function}
	 * @param {Object} oArrayLike
	 * @return {Array}
	*/
	function _fpToArray ( oArrayLike )
	{
		return Array.prototype.slice.call( oArrayLike );
	};

	/**
	 * "try-catch" function decoration
	 * Avoid double decoration if called twice on the same function
	 * @type {Function}
	 * @param {Function} fpFunc
	 * @param {Object} oContext
	 * @param {String} sErrMsg
	 * @return {Function}
	*/
	function _fpTryCatchDecorator ( fpFunc, oContext, sErrMsg )
	{
		var fpDecoratedFunc;

		if ( fpFunc.__decorated__ )
		{
			return fpFunc;
		}

		fpDecoratedFunc = function ()
		{
			try
			{
				return fpFunc.apply( oContext, _fpToArray( arguments ) );
			}
			catch ( eError )
			{
				_oTinyCore.ErrorHandler.log( sErrMsg + eError.message );
			}
		};

		fpDecoratedFunc.__decorated__ = _true_;

		return fpDecoratedFunc;
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
	var _oSandBoxFactory = ( function ()
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
		 * The topics data, e.g. :
		 * {
		 * 	'graph:color:change' : { 0:fn0, 3:fn3 },
		 *  'filter:date:change' : { 1:fn1, 2:fn2 ,3:fn3 }
		 * }
		 * Note : 0, 1, 2, 3 are the IDs of the subscribers and fn0, fn1, fn2, fn3, their related handlers
		 * @type {Object}
		 */
		var _oTopic2Subs = {};

		/**
		 * The subscribers data, given a subscriber's ID, this will allow us to retrieve easily all the topics subscribed, e.g. :
		 * {
		 * 	0 : [ 'graph:color:change' ],
		 * 	1 : [ 'filter:date:change' ],
		 * 	2 : [ 'filter:date:change' ],
		* 	3 : [ 'graph:color:change', 'filter:date:change' ],
		 * }
		 * Note : 0, 1, 2, 3 are the IDs of the subscribers
		 * @type {Object}
		 */
		var _oSub2Topics = {};

		/**
		 * Creates a new sandbox prototype.
		 * param {Number} nID The prototype ID
		 * @return {Object} The new sandbox prototype created
		 */
		var _fpCreatePrototype = function ( nID )
		{
			var _sSubID = nID;

			return {
				/**
				 * Subscribes to one or more topics
				 * @param {String|Array} aTopics A topic or an array of topics to subscribe to
				 * @param {Function} fpHandler The event handler
				 * @param {Object} oContext Optional, the context in which the handler should be executed
				 */
				subscribe : function ( aTopics, fpHandler, oContext )
				{
					var nIndex = 0,
						nTopicsCount,
						sTopic;

					if ( _fpIsFunction( fpHandler ) )
					{
						aTopics = _fpIsClass( aTopics, 'Array' ) ? aTopics : [aTopics];

						for ( nTopicsCount = aTopics.length ; nIndex < nTopicsCount; nIndex++ )
						{
							sTopic = aTopics[nIndex];
							_oTopic2Subs[sTopic] = _oTopic2Subs[sTopic] || {};

							if ( !_oTopic2Subs[sTopic][_sSubID] )
							{
								// Decorate the handler
								_oTopic2Subs[sTopic][_sSubID] = _oTinyCore.debugMode ?
									function ()
									{
										fpHandler.apply( oContext, _fpToArray( arguments ) );
									}
									: _fpTryCatchDecorator( fpHandler, oContext, 'Error publishing topic "' + sTopic + '": ' );

								_oSub2Topics[_sSubID] = _oSub2Topics[_sSubID] || [];
								_oSub2Topics[_sSubID].push( sTopic );
							}
						}
					}
				},

				/**
				 * Publishes a topic
				 * @param {String} sTopic
				 * @param {Object} oData
				 */
				publish : function ( sTopic, oData )
				{
					var oSubs = _oTopic2Subs[sTopic];

					if ( oSubs )
					{
						// Don't block the main thread
						oEnv.setTimeout( function ()
						{
							_fpForEach( oSubs, function ( fpHandler )
							{
								fpHandler( { name : sTopic, data : oData } );
							} );
						}, 0 );
					}
				},

				/**
				 * Unsubscribes from one or more topics
				 * @param {String|Array} aTopics A topic or an array of topics to unsubscribe from
				 */
				unSubscribe : function ( aTopics )
				{
					var aTopics = _fpIsClass( aTopics, 'Array' ) ? aTopics : [aTopics],
						nTopicsCount = aTopics.length,
						oSubs;

					while ( nTopicsCount-- )
					{
						oSubs = _oTopic2Subs[aTopics[nTopicsCount]]
						if ( oSubs && oSubs[_sSubID] )
						{
							delete oSubs[_sSubID];
						}
					}
				},

				/**
				 * Unsubscribes from all subscribed topics
				 */
				unSubscribeAll : function ()
				{
					if ( _oSub2Topics[_sSubID] )
					{
						this.unSubscribe( _oSub2Topics[_sSubID] );
					}
				}
			}
		};

		// The public API
		return {
			/**
			 * Builds a new sandbox
			 * @param {String} sType Optional, the sandbox type
			 * @return {Object} The new sandbox
			 */
			build : function ( sType )
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

	/* ------------------------------------ MODULES ------------------------------------ */

	/**
	 * The modules manager
	 * @type {Object}
	 */
	var _oModulesManager = ( function ()
	{
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

		// The public API
		return {
			/**
			 * Registers a new module
			 * @param {String} sModuleName The module name
			 * @param {Function} fpCreator The function that creates and returns a module instance
			 * @param {String} sSandBoxType Optional, the type of sandbox to provide to the module's instance
			 * @return {Boolean} Whether the module has been successfully registered or not
			 * @throws {Error} If the creator is not a function
			 */
			register : function ( sModuleName, fpCreator, sSandBoxType )
			{
				if ( !_oModules[sModuleName] )
				{
					if ( !_fpIsFunction( fpCreator ) )
					{
						throw new Error( 'The creator of module "'+sModuleName+'" is not a function!' );	
					}

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
					if ( _fpIsFunction( _oModules[sModuleName].oInstance.onStop ) )
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
				var oSandBox,
					oInstance;

				_fpCheckModuleRegistration( sModuleName );

				oSandBox = _oSandBoxFactory.build( _oModules[sModuleName].sSandBoxType );
				oInstance = _oModules[sModuleName].fpCreator( oSandBox );

				if ( !_oTinyCore.debugMode )
				{
					// Decorate the instance's methods by wrapping them into a try-catch statement
					_fpForEach( oInstance, function ( oInstanceProp, sInstancePropName )
					{
						if ( _fpIsFunction( oInstanceProp ) )
						{
							oInstance[sInstancePropName] = _fpTryCatchDecorator( oInstanceProp, oInstance, 'Error in module "'+sModuleName+'" executing method "'+sInstancePropName+'": ' );
						}
					} );
				}

				oInstance.__sandbox__ = oSandBox;

				return oInstance;
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
			}
		};
	} () );

	/* ------------------------------------ CORE ------------------------------------ */

	/**
	 * The core
	 * @type {Object}
	 */
	var _oTinyCore = {
		/**
		 * Current version
		 * @type {String}
		 */
		version : '0.4.0',

		/**
		 * Debug mode : if true, error in modules methods and topics subscribers will not be caught
		 * if false, errors will be caught and logged using the error handler
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
		 * The modules manager
		 * @type {Object}
		 */
		Module : _oModulesManager,

		/**
		 * The sandbox factory
		 * @type {Object}
		 */
		SandBox : _oSandBoxFactory,

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
		oEnv.define( 'TinyCore',  _oTinyCore );
	}
} ( this ) );