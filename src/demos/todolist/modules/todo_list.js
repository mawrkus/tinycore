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
				self.cropList( function ( oCurrentListItem )
				{
					return _dom.hasClass( oCurrentListItem, 'done' );
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
			
			oList = null;
		},

		/**
		 * Restores a todo list.
		 * @param  {Object} oList The object which keys are the todos IDs and values are the todos data
		 */
		restoreList : function ( oList )
		{
			var aListItems = _dom.getByClass( 'todo-item' ),
				nCount = aListItems.length,
				oCurrentTodo = null;

			while ( nCount-- )
			{
				_oDOM.remove( aListItems[nCount] );
			}

			for ( sTodoID in oList )
			{
				oCurrentTodo = oList[sTodoID];
				this.addTodo( sTodoID, oCurrentTodo.name, oCurrentTodo.done );
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
			var oLI = _dom.create( 'li' ),
				sClass = bDone ? ' done' : '',
				sCheckedAttr = bDone ? ' checked="checked"' : '',
				sLIHTML = '<input type="checkbox" id="todo-check-'+sTodoID+'" class="todo-check" value="'+sTodoID+'"'+sCheckedAttr+' /><span class="todo-name" id="todo-name-'+sTodoID+'">'+sTodoName+'</span><a class="todo-remove" id="todo-remove-'+sTodoID+'" title="remove '+sTodoName+'"" href="#" />';

			_dom.html( oLI, sLIHTML );
			_dom.setData( oLI, 'todo-id', sTodoID );
			_dom.addClass( oLI, 'todo-item' + sClass );

			_dom.append( _oList, oLI );
		},

		/**
		 * This method will be called when any element of the list is clicked.
		 * @param  {Event} eEvent The click event object
		 */
		onListClick : function ( eEvent )
		{
			var oTarget = eEvent.target;

			// Event delegation.
			while ( oTarget !== _oList )
			{
				if ( _dom.hasClass( oTarget, 'todo-check-all' ) )
				{
					this.toggleAllTodos( oTarget.checked );
					break;
				}
				else if ( _dom.hasClass( oTarget, 'todo-check' ) )
				{
					this.toggleTodo( oTarget.parentNode );	
					break;
				}
				else if ( _dom.hasClass( oTarget, 'todo-remove' ) )
				{
					this.removeTodo( oTarget.parentNode );
					eEvent.preventDefault();
					break;
				}

				oTarget = oTarget.parentNode;
			}
		},

		/**
		 * Toggles all todos.
		 * @param {Boolean} bDone Whether to mark them as done or not
		 */
		toggleAllTodos : function ( bDone )
		{
			var aListItems = _dom.getByClass( 'todo-item' ),
				nCount = aListItems.length,
				oCurrentListItem = null;

			while ( nCount-- )
			{
				oCurrentListItem = aListItems[nCount];

				if ( bDone !== _dom.hasClass( oCurrentListItem, 'done' ) )
				{
					this.toggleTodo( oCurrentListItem, bDone );
				}
			}
		},

		/**
		 * Toggles a todo (mark it as done or not and vice-versa, yes).
		 * @param {DOM Element} oListItem
		 * @param {Boolean} bDone Optional, whether to mark them as done or not
		 */
		toggleTodo : function ( oListItem, bDone )
		{
			var sTodoID = _dom.getData( oListItem, 'todo-id' ),
				oTodoName = _dom.getById( 'todo-name-'+sTodoID ),
				sTodoName = _dom.html( oTodoName ),
				bDone = typeof bDone === 'undefined' ? !_dom.hasClass( oListItem, 'done' ) : bDone,
				oCheckBox = _dom.getById( 'todo-check-'+sTodoID );

			oCheckBox.checked = bDone;
			_dom.toggleClass( oListItem, 'done', bDone );
			
			// Let's broadcast the news...
			oSandBox.publish( 'todo:update', { name : sTodoName, id : sTodoID, done : bDone } );
		},

		/**
		 * Removes the todos by using a filtering function.
		 * @param {Function} fpFilter A function receiving the current todo list item element and returning a boolean value that indicates if it should be removed or not
		 */
		cropList : function ( fpFilter )
		{
			var aListItems = _dom.getByClass( 'todo-item' ),
				nCount = aListItems.length,
				oCurrentListItem = null;

			while ( nCount-- )
			{
				oCurrentListItem = aListItems[nCount];

				if ( fpFilter( oCurrentListItem ) )
				{
					this.removeTodo( oCurrentListItem );
				}
			}
		},

		/**
		 * Removes a todo.
		 * @param {DOM Element} oListItem
		 */
		removeTodo : function ( oListItem )
		{
			var sTodoID = _dom.getData( oListItem, 'todo-id' ),
				sTodoName = _dom.html( _dom.getById( 'todo-name-'+sTodoID ) );
			
			_dom.remove( oListItem );

			// Let's broadcast the news...
			oSandBox.publish( 'todo:remove', { name : sTodoName, id : sTodoID, done : _dom.hasClass( oListItem, 'done' ) } );
		}
	};	
}, 'domlib_sandbox' );