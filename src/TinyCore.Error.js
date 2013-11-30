/* ---------  Error handling --------- */

	/**
	 * * The error handler.
	 * @type  {Object}
	 */
	TinyCore.Error = {
		/**
		 * * Logs an error message.
		 * @param  {String} sMsg
		 */
		log : function ( sMsg )
		{
			if ( oEnv.console && oEnv.console.error )
			{
				oEnv.console.error( sMsg );
			}
		},
		/**
		 * Throws an exception if in debug mode, log the error essage if not.
		 * @param  {String} sMsg
		 */
		report : function ( sMsg )
		{
			if ( TinyCore.debugMode )
			{
				throw new Error( sMsg );
			}
			else
			{
				this.log( sMsg );
			}
		}
	};
