/**
 * A tools factory for TinyCore.js
 * @author mawrkus (web@sparring-partner.be)
*/
;( function ( oEnv )
{
	'use strict';

	var TinyCore = oEnv.TinyCore,
		Utils = TinyCore.Utils;

	/**
	 * The available tools, each property holds a factory function that can create the tool requested.
	 * @type {Object}
	 */
	var _oTools = {},
	/**
	 * The current tool ID.
	 * @type {Number}
	 */
	_nToolID = -1;

	/**
	 * The tools factory.
	 * @type {Object}
	 */
	var _oToolbox = {
		/**
		 * Returns the tool requested.
		 * @param {String} sToolName
		 * @return {Mixed} The tool requested or null
		 */
		request : function ( sToolName )
		{
			var oToolData = _oTools[sToolName];
			return oToolData && oToolData.fpFactory && oToolData.fpFactory( ++_nToolID ) || null;
		},
		/**
		 * Register a new tool's factory function.
		 * @param  {String} sToolName
		 * @param  {Function} fpFactory
		 * @return {Boolean} Whether the registration was successful or not
		 */
		register : function ( sToolName, fpFactory )
		{
			if ( _oTools[sToolName] || !Utils.isFunction( fpFactory ) )
			{
				return false;
			}

			_oTools[sToolName] = {
				fpFactory : fpFactory
			};

			return true;
		}
	};

	// Define TinyCore a little bit more.
	TinyCore.Toolbox = _oToolbox;

} ( this ) );
