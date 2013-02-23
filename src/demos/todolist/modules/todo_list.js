/**
 * The list module, responsible for adding/updating/removing todos in/from the list.
 * Topics subscribed : "todo:add", "list:clear", "list:clean", "storage:sync"
 * Topics published : "todo:upddate", "todo:remove"
 */
TinyCore.register( 'todo_list', function ( oSandBox )
{
	// Shortcuts and private variable.
	var _dom = oSandBox.dom,
		_events = oSandBox.events,
		_utils = oSandBox.utils,
		_oList = null;

	// The module.
	return {
		/**
		 * This method will be called when the module is started.
		 * @param  {Object} oStartData The start data.
		 */
		onStart : function ( oStartData )
		{
			var self = this;

			oSandBox.subscribe( 'todo:add', function ( oTopic )
			{
				var oData = oTopic.data;
				self.addTodo( oData.id, oData.name );
			} );

			oSandBox.subscribe( 'list:clear', function ( oTopic )
			{
				self.cropList( function ()
				{
					return true;	
				} );
			} );

			oSandBox.subscribe( 'list:clean', function ( oTopic )
			{
				self.cropList( function ( oCurrentRow )
				{
					return _dom.hasClass( oCurrentRow, 'done' );
				} );
			} );

			oSandBox.subscribe( 'storage:sync', function ( oTopic )
			{
				self.restoreList( oTopic.data.list );
			} );

			_oList = _dom.getById( 'todo-list' );

			_events.bind( _oList, 'click', this.onListClick );
		},

		/**
		 * This method will be called when the module is stopped.
		 */
		onStop : function ()
		{
			_events.unbind( _oList, 'click', this.onListClick );
			
			_oList = null;
		},

		/**
		 * This method will be called when any element of the list is clicked.
		 * @param  {Event} eEvent The click event object
		 */
		onListClick : function ( eEvent )
		{
			var oTarget = eEvent.target;

			// Event delegation : let's do something only when clicking on a checkbox.
			while ( oTarget !== _oList && !_dom.hasClass( oTarget, 'todo-check' ) )
			{
				oTarget = oTarget.parentNode;
			}

			if ( oTarget !== _oList )
			{
				this.toggleTodo( oTarget.value );
			}
		},

		/**
		 * Adds a todo in the list.
		 * @param {String} sTodoID The todo's ID
		 * @param {String} sTodoName The new todo's name
		 * @param {Boolean} bDone Whether the todo should be marked as done or not
		 */
		addTodo : function ( sTodoID, sTodoName, bDone )
		{
			var sClass = bDone ? 'done' : '',
				sCheckedAttr = bDone ? ' checked="checked"' : '',
				sRow = '<tr id="todo-row-'+sTodoID+'" class="todo-row '+sClass+'"><td class="cell-check"><input type="checkbox" class="todo-check" value="'+sTodoID+'"'+sCheckedAttr+' /></td><td class="todo-name" id="todo-name-'+sTodoID+'">'+sTodoName+'</td></tr>';

			_dom.prepend( _oList, sRow );
		},

		/**
		 * Toggles a todo (mark it as done or not and vice-versa, yes).
		 * @param {String} sTodoID The todo's ID
		 */
		toggleTodo : function ( sTodoID )
		{
			var oTodoName = _dom.getById( 'todo-name-'+sTodoID ),
				sTodoName = _dom.html( oTodoName ),
				oRow = oTodoName.parentNode,
				bDone = _dom.hasClass( oRow, 'done' );

			_dom.toggleClass( oRow, 'done', !bDone );
			
			// Let's broadcast the news...
			oSandBox.publish( 'todo:update', { name : sTodoName, id : sTodoID, done : !bDone } );
		},

		/**
		 * Restores a todo list.
		 * @param  {Object} oList The object which keys are the todos IDs and values are the todos data
		 */
		restoreList : function ( oList )
		{
			var oCurrentTodo = null;

			_dom.html( _oList, '' );

			for ( sTodoID in oList )
			{
				oCurrentTodo = oList[sTodoID];
				this.addTodo( sTodoID, oCurrentTodo.name, oCurrentTodo.done );
			}
		},

		/**
		 * Removes the todos by using a filtering function.
		 * @param  {Function} fpFilter A function receiving the current todo row element and returning a boolean value that indicates if the row should be removed or not
		 */
		cropList : function ( fpFilter )
		{
			var aCheckboxes = _dom.getByClass( 'todo-row' ),
				nCount = aCheckboxes.length,
				oCurrentRow = null,
				sTodoID = '',
				sTodoName = '';

			while ( nCount-- )
			{
				oCurrentRow = aCheckboxes[nCount];

				if ( fpFilter( oCurrentRow ) )
				{
					sTodoID = oCurrentRow.id.split( 'todo-row-' )[1];
					sTodoName = _dom.html( _dom.getById( 'todo-name-'+sTodoID ) );
					
					_dom.remove( oCurrentRow );

					// Let's broadcast the news...
					oSandBox.publish( 'todo:remove', { name : sTodoName, id : sTodoID, done : _dom.hasClass( oCurrentRow, 'done' ) } );
				}
			}
		}
	};	
}, 'domlib_sandbox' );