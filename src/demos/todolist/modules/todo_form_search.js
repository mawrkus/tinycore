/**
 * The quick search module.
 * Topics subscribed : -
 * Topics published : "todo:search"
 */
TinyCore.Module.register( 'todo_form_search', function ( oSandBox )
{
	// Shortcuts and private variables.
	var _dom = oSandBox.dom,
		_events = oSandBox.events,
		_utils = oSandBox.utils,
		_nCurrentTodoID = 0,
		_oForm = null,
		_oInput = null,
		_oReset = null;

	// Some constants.
	var _CONSTANTS = {
		ESC_KEY : 27
	};

	// The module.
	return {
		/**
		 * This method will be called when the module is started.
		 * @param  {Object} oStartData The start data.
		 */
		onStart : function ( oStartData )
		{
			_oForm = _dom.getById( 'search-form' );
			_oInput = _dom.getById( 'search-input' );
			_oReset = _dom.getById( 'search-reset' );

			_oInput.value = '';

			_events.bind( _oForm, 'keyup', this.search );
			_events.bind( _oReset, 'click', this.reset );
		},

		/**
		 * This method will be called when the module is stopped.
		 */
		onStop : function ()
		{
			_events.unbind( _oReset, 'click', this.reset );
			_events.unbind( _oForm, 'keyup', this.search );

			_oReset = _oInput = _oForm = null;
		},

		/**
		 * Publishes a topic with the input text entered by the user.
		 * @param  {Event} eEvent The keyup/submit event object
		 */
		search : function ( eEvent )
		{
			var sQuery = '',
				nKeyCode = eEvent.keyCode || eEvent.which;

			if ( nKeyCode === _CONSTANTS.ESC_KEY )
			{
				this.reset();
				return;
			}
			
			sQuery = _utils.trim( _oInput.value );

			// Let's broadcast the news...
			oSandBox.publish( 'todo:search', { query : sQuery } );
			console.info('todo:search', { query : sQuery });
		},

		/**
		 * Resets the search.
		 */
		reset : function ()
		{
			_oInput.value = '';

			// Let's broadcast the news...
			oSandBox.publish( 'todo:search', { query : '' } );
			console.info('todo:search (reset)', { query : '' });
		}
	};	
}, 'domlib_sandbox' );