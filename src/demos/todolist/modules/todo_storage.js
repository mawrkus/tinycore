/**
 * The (optional) storage module, responsible for storing/restoring the todos.
 * The method chosen is defined by the storage_sandbox.
 * Note that since it does not need to manipulate the DOM, the sandbox type is different from the other modules.
 * Topics subscribed : "todo:add", "todo:update", "todo:remove"
 * Topics published : "storage:sync"
 */
TinyCore.Module.register( 'todo_storage', function ( oSandBox )
{
	// Shortcut and private variable.
	var _storage = oSandBox.storage,
		_oTodos = null;

	var _STORAGE_NAME = 'todos';

	// The module.
	return {
		/**
		 * This method will be called when the module is started.
		 * @param  {Object} oStartData The start data.
		 */
		onStart : function ( oStartData )
		{
			_oTodos = _storage.get( _STORAGE_NAME );

			if ( _oTodos )
			{
				// This is done to initialize properly the current todo ID when synching the storage (see todo_form.js).
				_oTodos.lastid = this.getLastID();
			}
			else
			{
				 _oTodos = {
					total :0,
					done : 0,
					list : {},
					lastid : -1
				};
			}

			oSandBox.publish( 'storage:sync', _oTodos ); // Let's tell the world!

			oSandBox.subscribe( 'todo:add', this.addTodo );
			oSandBox.subscribe( 'todo:update', this.updateTodo );
			oSandBox.subscribe( 'todo:remove', this.removeTodo );
		},

		getLastID : function ()
		{
			var sTodoID = '',
				nResult = -1;

			for ( sTodoID in _oTodos.list ) {}
				
			if ( sTodoID )
			{
				nResult = parseInt( sTodoID, 10 );
			}

			return nResult;
		},

		/**
		 * Adds a todo.
		 * @param {Object} oTopic The topic published
		 */
		addTodo : function ( oTopic )
		{
			var oData = oTopic.data;

			if ( _oTodos.list[oData.id] )
			{
				throw new Error( 'Add error : todo with ID="'+oData.id+'" already exist in storage ("'+oData.name+'")!', oData );
			}

			_oTodos.list[oData.id] = { name : oData.name, done : false };
			_oTodos.total++;

			_storage.set( _STORAGE_NAME, _oTodos );
		},

		/**
		 * Updates a todo.
		 * @param {Object} oTopic The topic published
		 */
		updateTodo : function ( oTopic )
		{
			var oData = oTopic.data;

			if ( !_oTodos.list[oData.id] )
			{
				throw new Error( 'Update error : todo with ID="'+oData.id+'" does not exist in storage ("'+oData.name+'")!', oData );
			}

			_oTodos.list[oData.id] = { name : oData.name, done : oData.done };
			_oTodos.done += oData.done ? +1 : -1;

			_storage.set( _STORAGE_NAME, _oTodos );
		},

		/**
		 * Removes a todo.
		 * @param {Object} oTopic The topic published
		 */
		removeTodo : function ( oTopic )
		{
			var oData = oTopic.data;

			if ( !_oTodos.list[oData.id] )
			{
				throw new Error( 'Remove error : todo with ID="'+oData.id+'" does not exist in storage!', oData );
			}

			delete _oTodos.list[oData.id];
			_oTodos.total--;

			if ( oData.done )
			{
				_oTodos.done--;
			}

			_storage.set( _STORAGE_NAME, _oTodos );
		},

		/**
		 * This method will be called when the module is stopped.
		 */
		onStop : function ()
		{
			_oTodos = null;
		}
	};	
}, 'storage_sandbox' );