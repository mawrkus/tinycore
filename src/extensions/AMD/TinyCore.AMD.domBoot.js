/**
 * AMD DOM boot extension for TinyCore.js
 * Loads and starts the modules from their declaration in the markup
 * @author mawrkus (web@sparring-partner.be)
 * @requires TinyCore.js, TinyCore.AMD.js
*/
( function ( oEnv )
{
	'use strict';

	var TinyCore = oEnv.TinyCore,
		Utils = TinyCore.Utils,
		AMD = TinyCore.AMD,
		JSON = oEnv.JSON,
		doc = document;

	/* Private. */

	/**
	 * An array containing the data related to all the modules found in DOM.
	 * @type {Array}
	 */
	var _aModulesData = [],
		/**
		 * The default configuration for the DOM boot loader.
		 * @type {Object}
		 */
		DEFAULT_DOMBOOT_CONFIG = {
			nodesIgnored : { 'SCRIPT' : true, 'IFRAME' : true }
		},
		/**
		 * The attribute name for modules definitions.
		 * @type {String}
		 */
		DATA_ATTR_NAME_MODULES_DEF = 'data-tc-modules',
		/**
		 * The char used as modules separator in "data-" attributes.
		 * @type {String}
		 */
		DOMBOOT_MODULES_SEP = ';',
		/**
		 * The regular expression used to extract modules definitions from "data-" attributes.
		 * @type {RegExp}
		 */
		DOMBOOT_MODULE_DEF_REGEXP = new RegExp( '([\\w-]+)(\\s*:\\s*({[^'+DOMBOOT_MODULES_SEP+']*}))?' ),
		/**
		 * The attribute name for deferred settings.
		 * @type {String}
		 */
		DATA_ATTR_NAME_DEFERRED = 'data-tc-defer',
		/**
		 * The char used as deferred settings separator in "data-" attributes.
		 * @type {String}
		 */
		DEFERRED_SETTINGS_SEP = ';',
		/**
		 * An object containing the data related to all the modules found in DOM which load is to be deferred.
		 * @type {Object}
		 */
		_oDeferredData = {},
		/**
		 * The current configuration.
		 * @type {Object}
		 */
		_oConfig = {},
		/**
		 * Parses some JSON. Is defined at run time to take into account the value of TinyCore.debugMode (see domBoot).
		 * @param  {String} sJSON
		 * @return {Mixed}
		 * @throws {Error} If the JSON parsing fails
		 */
		_fpParseJSON = null,
		/**
		 * Registers an event listener.
		 * @return {Function}
		 */
		_fpBindEvent = ( function ()
		{
			return doc.attachEvent ?
					function ( oElement, sEventName, fpListener )
					{
						oElement.attachEvent( 'on'+sEventName, fpListener );
					} :
					function ( oElement, sEventName, fpListener )
					{
						oElement.addEventListener( sEventName, fpListener, false );
					};
		} () ),
		/**
		 * Unregisters an event listener.
		 * @return {Function}
		 */
		_fpUnbindEvent = ( function ()
		{
			return doc.detachEvent ?
					function ( oElement, sEventName, fpListener )
					{
						oElement.detachEvent( 'on'+sEventName, fpListener );
					} :
					function ( oElement, sEventName, fpListener )
					{
						oElement.removeEventListener( sEventName, fpListener, false );
					};
		} () ),
		/**
		 * Returns the trimmed value of the named attribute on the specified element.
		 * @param  {DOM Element} oNode
		 * @param  {String} sAttr
		 * @return {String}
		 */
		_fpGetAttribute = function ( oNode, sAttr )
		{
			var sValue = oNode.getAttribute( sAttr );
			sValue = sValue ? sValue.trim() : '';
			return sValue;
		},
		/**
		 * Recursive scan of a DOM tree to find the nodes that have modules declared.
		 * @param {DOM Element} oCurrentNode The current DOM node
		 */
		_fpScanDOM = function ( oCurrentNode )
		{
			var sDataAttr;

			if ( _oConfig.nodesIgnored[oCurrentNode.nodeName] !== true )
			{
				sDataAttr = _fpGetAttribute( oCurrentNode, DATA_ATTR_NAME_MODULES_DEF );
				if ( sDataAttr )
				{
					_fpProcessDataAttr( oCurrentNode, sDataAttr );
				}
			}

			oCurrentNode = oCurrentNode.firstChild;
			while ( oCurrentNode )
			{
				if ( oCurrentNode.nodeType === 1 ) // elements only
				{
					_fpScanDOM( oCurrentNode );
				}
				oCurrentNode = oCurrentNode.nextSibling;
			}
		},
		/**
		 * Extracts and saves useful module data from the data attribute of the node passed as parameter.
		 * @param  {DOM Element} oNode
		 * @param  {String} sDataAttr
		 */
		_fpProcessDataAttr = function ( oNode, sDataAttr )
		{
			// Expect something like 'module1;module2:{"test":"true","false":false, "null":{}};module3'
			var aModules = sDataAttr.split( DOMBOOT_MODULES_SEP ),
				aModulesData = [],
				sDeferredAttr,
				aDeferredSettings,
				aDeferredParts,
				sDeferType,
				sDeferTypeVal;

			aModules.forEach( function ( sData )
			{
				// Expect something like module2:{"test":"true","false":false, "null":{}}
				var aModuleParts = sData.match( DOMBOOT_MODULE_DEF_REGEXP ) || [],
					sModuleName = aModuleParts[1] && aModuleParts[1].trim(),
					sStartData,
					oModuleData;

				if ( !sModuleName )
				{
					return;
				}

				sStartData = aModuleParts[3] && aModuleParts[3].trim();
				oModuleData = { name : sModuleName };
				oModuleData.startData = sStartData ? _fpParseJSON( sStartData ) : {};
				oModuleData.startData.element = oNode;

				aModulesData.push( oModuleData );
			} );

			sDeferredAttr = _fpGetAttribute( oNode, DATA_ATTR_NAME_DEFERRED );
			if ( !sDeferredAttr )
			{
				_aModulesData = _aModulesData.concat( aModulesData );
			}
			else
			{
				// Expect something like event:click;time:10000
				aDeferredSettings = sDeferredAttr.split( DEFERRED_SETTINGS_SEP );

				aDeferredSettings.forEach( function ( sDeferredSetting )
				{
					if ( !sDeferredSetting )
					{
						return;
					}

					aDeferredParts = sDeferredSetting.split( ':' );
					sDeferType = aDeferredParts[0] && aDeferredParts[0].trim();
					sDeferTypeVal = aDeferredParts[1] && aDeferredParts[1].trim();

					_oDeferredData[sDeferType] = _oDeferredData[sDeferType] || {};
					_oDeferredData[sDeferType][sDeferTypeVal] = _oDeferredData[sDeferType][sDeferTypeVal] || [];

					_oDeferredData[sDeferType][sDeferTypeVal].push( {
						node : oNode,
						modulesData : aModulesData,
						typeVal : sDeferTypeVal
					} );
				} );
			}
		},
		/**
		 * Initializes the deferred loadings, if any.
		 * @param {Function} fpCallback Optional, the function to call when all modules are loaded and started, it receives the array of modules names
		 */
		_fpInitDeferred = function ( fpCallback )
		{
			var fpBindOnce = function ( sEventName, oDeferData )
			{
				var oNode = oDeferData.node,
					fpDecListener = function ( eEvent )
					{
						_fpUnbindEvent( oNode, sEventName, fpDecListener );
						fpReqAndStart( oDeferData.modulesData, fpCallback );
					};

				_fpBindEvent( oNode, sEventName, fpDecListener );
			},
			fpSetDelay = function ( nDelay, aAllModulesData )
			{
				setTimeout( function ()
				{
					fpReqAndStart( aAllModulesData, fpCallback );
				}, nDelay );
			},
			fpBindDistancesCheck = function ( aAllDeferData )
			{
				var fpCheck = function ( eEvent )
				{
					var nMouseX = eEvent.pageX || eEvent.clientX + doc.body.scrollLeft,
						nMouseY = eEvent.pageY || eEvent.clientY + doc.body.scrollTop,
						aDeferLoaded = [];

					aAllDeferData.forEach( function ( oDeferData, nIndex )
					{
						var nDistance = +oDeferData.typeVal,
							oRect = oDeferData.node.getBoundingClientRect(),
							nLeftLimit = oRect.left - nDistance,
							nRightLimit = oRect.right + nDistance,
							nTopLimit = oRect.top - nDistance,
							nBottomLimit = oRect.bottom + nDistance;

						if ( ( nMouseX >= nLeftLimit && nMouseX <= nRightLimit ) &&
								( nMouseY >= nTopLimit && nMouseY <= nBottomLimit ) )
						{
							aDeferLoaded.push( nIndex );
							fpReqAndStart( oDeferData.modulesData, fpCallback );
						}
					} );

					aDeferLoaded.forEach( function ( nIndex )
					{
						aAllDeferData.splice( nIndex, 1 );
					} );

					if ( !aAllDeferData.length )
					{
						_fpUnbindEvent( doc, 'mousemove', fpCheck );
					}
				};

				_fpBindEvent( doc, 'mousemove', fpCheck );
			},
			fpReqAndStart = function ( aModulesData, fpCallback )
			{
				var aModules2Load = [];

				aModulesData.forEach( function ( oModuleData )
				{
					var sModuleName = oModuleData.name;

					if ( !_oDeferredData._loaded[sModuleName] )
					{
						_oDeferredData._loaded[sModuleName] = true;
						aModules2Load.push( oModuleData );
					}
				} );

				if ( aModules2Load.length )
				{
					AMD.requireAndStart( aModules2Load, fpCallback );
				}
			},
			aAllDeferData = [];

			_oDeferredData._loaded = {};

			// Events handlers.
			Utils.forIn( _oDeferredData.event, function ( aEventData, sEventName )
			{
				aEventData.forEach( function ( oDeferData )
				{
					fpBindOnce( sEventName, oDeferData );
				} );
			} );
			delete _oDeferredData.event;

			// Timers.
			Utils.forIn( _oDeferredData.time, function ( aTimingData, nDelay )
			{
				var aAllModulesData = [];

				aTimingData.forEach( function ( oDeferData )
				{
					aAllModulesData = aAllModulesData.concat( oDeferData.modulesData );
				} );

				fpSetDelay( nDelay, aAllModulesData );
			} );
			delete _oDeferredData.time;

			// Distances.
			Utils.forIn( _oDeferredData.distance, function ( aDistanceData )
			{
				aAllDeferData = aAllDeferData.concat( aDistanceData );
			} );
			if ( aAllDeferData.length )
			{
				fpBindDistancesCheck( aAllDeferData );
			}
			delete _oDeferredData.distance;
		};

	/**
	 * The AMD DOM boot extension.
	 * @type {Object}
	 */
	var _oDOMBootExt = {
		/**
		 * Scans the DOM for module declarations, then loads asynchronously and starts all the module found.
		 * @param {DOM Element} oRootNode Optional, the root node to start scanning from, defaults to document.body
		 * @param {Function} fpCallback Optional, the function to call when all modules are loaded and started, it receives the array of modules names
		 */
		domBoot : function (/* oRootNode, fpCallback */)
		{
			var oRootNode,
				fpCallback;

			if ( Utils.isFunction( arguments[0] ) )
			{
				oRootNode = doc.body;
				fpCallback = arguments[0];
			}
			else
			{
				oRootNode = arguments[0] || doc.body;
				fpCallback = arguments[1];
			}

			_fpParseJSON = function ( sJSON )
			{
				return JSON.parse( sJSON );
			};
			if ( !TinyCore.debugMode )
			{
				_fpParseJSON = Utils.tryCatchDecorator( null, _fpParseJSON, 'Error while booting from DOM! ' );
			}

			_oConfig = AMD.config().domBoot;

			_aModulesData = [];

			_fpScanDOM( oRootNode );

			if ( _aModulesData.length )
			{
				AMD.requireAndStart( _aModulesData, fpCallback );
			}

			_fpInitDeferred( fpCallback );
		}
	};

	// Redefine TinyCore.
	Utils.extend( AMD.config(), { domBoot : DEFAULT_DOMBOOT_CONFIG } );
	Utils.extend( AMD, _oDOMBootExt );

} ( this ) );
