/**
 * Jasmine testing extension for the Toolbox of TinyCore.js
 * @author mawrkus (web@sparring-partner.be)
 * @requires TinyCore.js
*/
;( function ( oEnv )
{
	'use strict';

	var TinyCore = oEnv.TinyCore,
		Utils = TinyCore.Utils,
		Toolbox = TinyCore.Toolbox,
		jasmine = oEnv.jasmine,
		spyOn = oEnv.spyOn;

	if ( !jasmine || !Utils.isFunction( spyOn ) )
	{
		throw new Error( 'Cannot add Jasmine extension to TinyCore: Jasmine seems to be missing!' );
	}

	/**
	 * Already stubbed tools.
	 * @type {Object}
	 */
	var _oStubbedTools = {},
		/**
		 * Spies on all the methods of the given object.
		 * @param {Object} oObject
		 * @return {Object}
		 */
		_fpCreateStub = function ( oObject )
		{
			if ( !oObject )
			{
				return null;
			}

			Utils.forEach( oObject, function ( prop, propName )
			{
				if ( Utils.isFunction( prop ) && !prop.isSpy )
				{
					spyOn( oObject, propName );
				}
			} );

			return oObject;
		};

	/**
	 * The Jasmine extension.
	 * @type {Object}
	 */
	var _oJasmineExt = {
		/**
		 * Returns the tool requested with all its methods stubbed.
		 * @param {String} sToolName
		 * @return {Mixed} The tool requested or null
		 */
		request : ( function ( fpOriginalRequest )
		{
			return function ( sToolName )
			{
				var oTool = _oStubbedTools[sToolName];
				if ( oTool )
				{
					// Spies are torn down at the end of every spec.
					return _fpCreateStub( oTool );
				}

				oTool = fpOriginalRequest.apply( Toolbox, arguments );

				// We always return the same stubbed version.
				_oStubbedTools[sToolName] = _fpCreateStub( oTool );

				return oTool;
			};
		} ( Toolbox.request ) )
	};

	// Redefine TinyCore .
	Utils.extend( Toolbox, _oJasmineExt );

} ( this ) );
