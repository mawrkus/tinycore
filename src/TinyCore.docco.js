//     tinyCore.js 0.4.0
//     https://github.com/mawrkus/tinycore

;( function ( oEnv )
{
	'use strict';

	// HELPERS
	// ----------

	// Helps minification
	var _true_ = true, _false_ = false, _null_ = null;

	// Determine the class of an object
	function _fpIsClass ( oMixed, sClassName )
	{
		return Object.prototype.toString.call( oMixed ) === '[object '+sClassName+']';
	};

	// Determine if the parameter is a function
	function _fpIsFunction ( oMixed )
	{
		return _fpIsClass( oMixed, 'Function' );
	};

	// Run through all the properties of an object
	// and applies a callback function on each of them
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

	// Merge recursively two objects by adding the source 
	// object properties to the destination object
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

	// Convert an array-like object to an actual array
	function _fpToArray ( oArrayLike )
	{
		return Array.prototype.slice.call( oArrayLike );
	};

	// "try-catch" function decoration  
	// Avoid double decoration if called twice on the same function
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

	// ERROR HANDLER
	// -------------

	var _oErrorHandler = {
		// Log an error message
		log : function ( sMsg )
		{
			oEnv.console && oEnv.console.error( sMsg );
		}
	};
	
	// _Example of Handling Errors:_  
	// <iframe width="450" height="450" src="http://jsfiddle.net/juanma/nzEuH/embedded/" frameborder="0"></iframe>
	// <br/>

	// SANDBOX
	// ----------
	var _oSandBoxFactory = ( function ()
	{
		
		var _oSandBoxes = {};
		var _nSandBoxesCount = 0;
		var _oTopic2Subs = {};
		var _oSub2Topics = {};

		var _fpCreatePrototype = function ( nID )
		{
			var _sSubID = nID;

			//## _Default methods_
			return {
				 // ###subscribe
				 // Subscribe a function (handler) to one or more topics
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

				// ###publish
				// Publishes a topic
				publish : function ( sTopic, oData )
				{
					var oSubs = _oTopic2Subs[sTopic];

					if ( oSubs )
					{
						oEnv.setTimeout( function ()
						{
							_fpForEach( oSubs, function ( fpHandler )
							{
								fpHandler( { name : sTopic, data : oData } );
							} );
						}, 0 );
					}
				},

				// ###unSubscribe
				// Unsubscribe from one or more topics
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

				// ###unSubscribeAll
				// Unsubscribe from all subscribed topics
				unSubscribeAll : function ()
				{
					if ( _oSub2Topics[_sSubID] )
					{
						this.unSubscribe( _oSub2Topics[_sSubID] );
					}
				}
				
				// _Example of Subscribing & Notifyng Topics (Events):_  
				// <iframe width="450" height="450" src="http://jsfiddle.net/juanma/Sjq4S/embedded/" frameborder="0"></iframe>
				// <br/>
				// _More examples about Subscribing & Notifyng Topics:_  
				// - [TinyCore.js - Subscribe/Publish Events](http://jsfiddle.net/juanma/T37kN/)  
				// - [TinyCore.js - Subscribe/UnSubscribe/Publish Events](http://jsfiddle.net/juanma/DYxqN/)


			}
		};

		//## _The public API_
		return {
			
			// ###build
			// Build a new sandbox
			build : function ( sType )
			{
				return _fpMerge( _fpCreatePrototype( ++_nSandBoxesCount ), _oSandBoxes[sType] || {} );
			},

			// ###register
			// Register a new sandbox
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

	// MODULES
	// -------


	var _oModulesManager = ( function ()
	{
		// Store following info info for registered modules
		// 
		// 	_oModules[sModuleName] = {  
		// 		fpCreator	: fpCreator,  
		// 		sSandBoxType : sSandBoxType || '',  
		// 		oInstance	: _null_,  
		// 		bIsStarted	: _false_  
		// 	};  
		// 
		var _oModules = {};

		// Check if a module has been registered or not
		// and throws an exception accordingly
		var _fpCheckModuleRegistration = function ( sModuleName )
		{
			if ( !_oModules[sModuleName] )
			{
				throw new Error( 'Module "'+sModuleName+'" is not registered!' );
			}
		};

		// ## _The public API_
		return {

			// ###register
			// Registers a new module
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

			// ###start
			// Starts a module by creating a new module instance
			// and calling its "onStart" method with oStartData passed as parameter  
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

			// <br/>
			// _Examples of Registering & Starting Modules:_  
			// <iframe width="450" height="450" src="http://jsfiddle.net/juanma/eQ498/embedded/" frameborder="0"></iframe>
			// <br/>
			// _More examples about Register/Start Modules:_  
			// - [TinyCore.js - Register/Start Modules (basic)](http://jsfiddle.net/juanma/bVZy5/)  
			// - [TinyCore.js - Register/Start Modules (intermediate)](http://jsfiddle.net/juanma/36J6M/)  


			// ###stop
			// Stops a module by calling its "onStop" method
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

			// ###instanciate
			// Instanciates a module
			instanciate : function ( sModuleName )
			{
				var oSandBox,
					oInstance;

				_fpCheckModuleRegistration( sModuleName );

				oSandBox = _oSandBoxFactory.build( _oModules[sModuleName].sSandBoxType );
				oInstance = _oModules[sModuleName].fpCreator( oSandBox );

				if ( !_oTinyCore.debugMode )
				{
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

			// ###getModules
			// Returns the data related to all registered modules  
			// Allows the extensions to have access to the modules data
			getModules : function ()
			{
				return _oModules;
			}
		};
	} () );

	// CORE
	// -------

	var _oTinyCore = {

		// ###version
		// Current version of the library
		version : '0.4.0',

		// ###debugMode
		// Activate debug mode setting it to `true` (will not catch errors in functions)
		debugMode : _false_,

		// ###extend
		// Allows TinyCore to be extended by merging recursively an object into it
		extend : function ( oExtension )
		{
			_fpMerge( this, oExtension );
		},

		// ###Module
		// The modules manager
		Module : _oModulesManager,

		// ###SandBox
		// The sandbox factory
		SandBox : _oSandBoxFactory,


		// ###ErrorHandler
		// The error handler
		ErrorHandler : _oErrorHandler
	};

	// _Add TinyCore to the environment (windows, global, ...)._
	oEnv.TinyCore = _oTinyCore;

	if ( oEnv.define )
	{
		// _Define an AMD module._
		oEnv.define( 'TinyCore',  _oTinyCore );
	}
} ( this ) );