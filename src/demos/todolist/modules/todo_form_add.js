/**
 * The add module, responsible for publishing a topic with the new todo(s) data, when the user submits the form.
 * Topics subscribed : "storage:sync"
 * Topics published : "todo:add"
 */
TinyCore.Module.register( 'todo_form_add', function ( oSandBox )
{
	// Shortcuts and private variables.
	var _dom = oSandBox.dom,
		_events = oSandBox.events,
		_utils = oSandBox.utils,
		_nCurrentTodoID = 0,
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
			oSandBox.subscribe( 'storage:sync', function ( oTopic )
			{
				// Get the last todo ID from the storage module.
				_nCurrentTodoID = oTopic.data.lastid + 1;
			} );

			_oForm = _dom.getById( 'todo-form-add' );
			_oInput = _dom.getById( 'add-input' );

			_oInput.value = '';
			_events.focus( _oInput );

			_events.bind( _oForm, 'submit', this.onFormSubmit );
		},

		/**
		 * This method will be called when the module is stopped.
		 */
		onStop : function ()
		{
			_events.unbind( _oForm, 'submit', this.onFormSubmit );

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
				sCurrentName = _utils.trim( aNames[nIndex] );
				if ( sCurrentName )
				{
					// Let's broadcast the news...
					oSandBox.publish( 'todo:add', { name : sCurrentName, id : _nCurrentTodoID++ } );
				}
			}

			_oInput.value = '';

			eEvent.preventDefault();
		}
	};	
}, 'domlib_sandbox' );