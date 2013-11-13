/**
 * The add module, responsible for publishing a topic with the new todo(s) data, when the user submits the form.
 *
 * Topics subscribed : "storage:sync"
 * Topics published : "todo:add"
 */
TinyCore.AMD.define( 'todo_form_add', ['mediator', 'tools/dom', 'tools/events'], function ( _mediator, _dom, _events )
{
	'use strict';

	// Private variables.
	var _nCurrentTodoID = 0,
		_oForm = null,
		_oInput = null;

	// The module.
	return {
		/**
		 * This method will be called when the module is started.
		 * @param  {Object} oStartData The start data.
		 */
		onStart : function ( oStartData )
		{
			_mediator.subscribe( 'storage:sync', function ( oTopic )
			{
				// Get the last todo ID from the storage module.
				_nCurrentTodoID = oTopic.data.lastid + 1;
			} );

			_oForm = _dom.getById( 'todo-form-add' );
			_oInput = _dom.getById( 'add-input' );

			_oInput.value = '';
			_events.focus( _oInput );

			_events.on( _oForm, 'submit', this.onFormSubmit );
		},

		/**
		 * This method will be called when the module is stopped.
		 */
		onStop : function ()
		{
			_events.off( _oForm, 'submit', this.onFormSubmit );
			_oInput = _oForm = null;
		},

		/**
		 * This method will be called when the form is submitted.
		 * @param  {Event} eEvent The submit event object
		 */
		onFormSubmit : function ( eEvent )
		{
			var aNames = _oInput.value.split( ',' ),
				nNamesCount = aNames.length,
				nIndex = 0,
				sCurrentName = '';

			for ( ; nIndex<nNamesCount; nIndex++ )
			{
				sCurrentName = aNames[nIndex].trim();
				if ( sCurrentName )
				{
					// Let's broadcast the news...
					_mediator.publish( 'todo:add', { name : sCurrentName, id : _nCurrentTodoID++ } );
				}
			}

			_oInput.value = '';

			eEvent.preventDefault();
		}
	};
} );
