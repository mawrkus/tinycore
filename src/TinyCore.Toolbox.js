/* ---------  Tools factory --------- */

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
	TinyCore.Toolbox = {
		/**
		 * Returns the tool requested.
		 * @param {String} sToolName
		 * @return {Mixed} The tool requested or null
		 */
		request : function ( sToolName )
		{
			var oToolData = _oTools[sToolName];
			return oToolData && oToolData.fpFactory && oToolData.fpFactory( ++_nToolID ) || _null_;
		},
		/**
		 * Register a new tool's factory function.
		 * @param  {String} sToolName
		 * @param  {Function} fpFactory
		 * @return {Boolean} Whether the registration was successful or not
		 */
		register : function ( sToolName, fpFactory )
		{
			if ( _oTools[sToolName] || !_oUtils.isFunction( fpFactory ) )
			{
				return _false_;
			}

			_oTools[sToolName] = {
				fpFactory : fpFactory
			};

			return _true_;
		}
	};
