/**
 * The list module, responsible for adding/updating/removing todos in/from the list.
 * Topics subscribed : "todo:add", "list:clear", "list:clean", "todo:search", "storage:sync"
 * Topics published : "todo:upddate", "todo:remove"
 */
TinyCore.AMD.define( 'todo_list', ['mediator', 'tools/dom_utils_events'], function ( MEDIATOR, DOM_UTILS_EVENTS )
{
	'use strict';

	// Shortcuts and private variable.
	var _dom = DOM_UTILS_EVENTS.dom,
		_events = DOM_UTILS_EVENTS.events,
		_utils = DOM_UTILS_EVENTS.utils,
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

			MEDIATOR.subscribe( 'todo:add', function ( oTopic )
			{
				var oData = oTopic.data;
				self.addTodo( oData.id, oData.name );
			} );

			MEDIATOR.subscribe( 'list:clear', function ( oTopic )
			{
				self.forEachTodo( self.removeTodo, function ()
				{
					return true;
				} );
			} );

			MEDIATOR.subscribe( 'list:clean', function ( oTopic )
			{
				self.forEachTodo( self.removeTodo, function ( oCurrentListItem )
				{
					return _dom.hasClass( oCurrentListItem, 'done' ) && _dom.isVisible( oCurrentListItem );
				} );
			} );

			MEDIATOR.subscribe( 'todo:search', function ( oTopic )
			{
				var oData = oTopic.data;

				self.forEachTodo( function ( oCurrentListItem )
				{
					var sTodoID = _dom.getData( oCurrentListItem, 'todo-id' ),
						sTodoName = _dom.html( _dom.getById( 'todo-name-'+sTodoID ) );

					_dom.toggle( oCurrentListItem, sTodoName.indexOf( oData.query ) !== -1 );
				} );
			} );

			MEDIATOR.subscribe( 'storage:sync', function ( oTopic )
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
			var oCurrentTodo = null,
				sTodoID = '';

			this.forEachTodo( function ( oCurrentListItem )
			{
				_oDOM.remove( oCurrentListItem );
			} );

			for ( sTodoID in oList )
			{
				oCurrentTodo = oList[sTodoID];
				this.addTodo( sTodoID, oCurrentTodo.name, oCurrentTodo.done );
			}
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
					var self = this,
						bDone = oTarget.checked;

					this.forEachTodo(
						function ( oCurrentListItem )
						{
							self.toggleTodo( oCurrentListItem, bDone );
						},
						function ( oCurrentListItem )
						{
							return bDone !== _dom.hasClass( oCurrentListItem, 'done' ) && _dom.isVisible( oCurrentListItem );
						}
					);
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
		 * Toggles a todo (mark it as done or not and vice-versa, yes).
		 * @param {DOM Element} oListItem
		 * @param {Boolean} bDone Optional, whether to mark them as done or not
		 */
		toggleTodo : function ( oListItem, bDone )
		{
			var sTodoID = _dom.getData( oListItem, 'todo-id' ),
				oTodoName = _dom.getById( 'todo-name-'+sTodoID ),
				sTodoName = _dom.html( oTodoName ),
				oCheckBox = _dom.getById( 'todo-check-'+sTodoID );

			bDone = typeof bDone === 'undefined' ? !_dom.hasClass( oListItem, 'done' ) : bDone;

			oCheckBox.checked = bDone;
			_dom.toggleClass( oListItem, 'done', bDone );

			// Let's broadcast the news...
			MEDIATOR.publish( 'todo:update', { name : sTodoName, id : sTodoID, done : bDone } );
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
			MEDIATOR.publish( 'todo:remove', { name : sTodoName, id : sTodoID, done : _dom.hasClass( oListItem, 'done' ) } );
		},

		/**
		 * Performs an action on each todo, depending on the result of a filtering function.
		 * @param {Function} fpAction The function that will performs the action
		 * @param {Function} fpFilter Optional, a function receiving the current todo list item element and returning a boolean value that indicates if the action should be executed on that todo or not
		 */
		forEachTodo : function ( fpAction, fpFilter )
		{
			var aListItems = _dom.getByClass( 'todo-item' ),
				nCount = aListItems.length,
				oCurrentListItem = null;

			fpFilter = fpFilter || function ( oCurrentListItem ) { return true; };

			while ( nCount-- )
			{
				oCurrentListItem = aListItems[nCount];

				if ( fpFilter( oCurrentListItem ) )
				{
					fpAction( oCurrentListItem );
				}
			}
		}
	};
} );
