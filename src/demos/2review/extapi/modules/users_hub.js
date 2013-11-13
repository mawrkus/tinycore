/**
 * A fake users hub module.
 * Note that this module will NOT have access to dom and utils functions through its sandbox.
 */
TinyCore.Module.register( 'users_hub', function ( oSandBox )
{
	'use strict';
	
	/**
	 * The module object.
	 */
	return {
		/**
		 * This method will be called when the module is started.
		 * @param {Object} oStartData Data passed to this module when started
		 */
		onStart : function ( oStartData )
		{
			setTimeout( function ()
			{
				oSandBox.publish( 'user:connected', { username : 'mawkus' } );
			}, 1000 );

			setTimeout( function ()
			{
				oSandBox.publish( 'user:connected', { username : 'juanma' } );
			}, 1300 );

			setTimeout( function ()
			{
				oSandBox.publish( 'user:disconnected', { username : 'juanma' } );
			}, 1900 );

			setTimeout( function ()
			{
				oSandBox.publish( 'user:connected', { username : 'alfred' } );
			}, 2000 );

			setTimeout( function ()
			{
				oSandBox.publish( 'user:disconnected', { username : 'alfred' } );
			}, 3500 );

			setTimeout( function ()
			{
				oSandBox.publish( 'user:message', { username : 'mawkus', text : 'time to leave...' } );
				oSandBox.publish( 'user:disconnected', { username : 'mawkus' } );
			}, 4500 );
		}
	};
} );