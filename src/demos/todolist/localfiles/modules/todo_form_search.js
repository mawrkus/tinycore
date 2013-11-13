/**
 * The quick search module.
 *
 * Topics subscribed : -
 * Topics published : "todo:search"
 */
TinyCore.Module.define( 'todo_form_search', ['mediator', 'dom', 'events'], function ( _mediator, _dom, _events )
{
	'use strict';

	// Private variables.
	var _nCurrentTodoID = 0,
		_oForm = null,
		_oInput = null,
		_oReset = null;

	// Constants.
	var KEYCODE_ESC = 27;

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

			_events.on( _oForm, 'keyup', this.search );
			_events.on( _oReset, 'click', this.reset );
		},

		/**
		 * This method will be called when the module is stopped.
		 */
		onStop : function ()
		{
			_events.off( _oReset, 'click', this.reset );
			_events.off( _oForm, 'keyup', this.search );

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

			if ( nKeyCode === KEYCODE_ESC )
			{
				this.reset();
				return;
			}

			sQuery =_oInput.value.trim();

			// Let's broadcast the news...
			_mediator.publish( 'todo:search', { query : sQuery } );
		},

		/**
		 * Resets the search.
		 */
		reset : function ()
		{
			_oInput.value = '';

			// Let's broadcast the news...
			_mediator.publish( 'todo:search', { query : '' } );
		}
	};
} );
