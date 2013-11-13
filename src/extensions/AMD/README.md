## TinyCore.js / Extensions

### AMD

#### Features

- Wrapper over [require.js](http://requirejs.org).
- Provides async modules loading using the [Asynchronous Module Definition](https://github.com/amdjs/amdjs-api/wiki/AMD) format.
- Less than 1Kb minified + 15Kb for require.js.

#### TinyCore.AMD API

```js
TinyCore.AMD.config( settings )
TinyCore.AMD.define( moduleName, dependencies, creatorFunction )
TinyCore.AMD.require( resourcesNames, callback )
TinyCore.AMD.requireAndStart( modulesData, callback )
TinyCore.AMD.setErrorHandler( errorHandler )
```

#### Examples

An example from "demos/todolist/amd/index.html" :

**app.js :**
```js
TinyCore.AMD.config( {
	require : {
		// see http://requirejs.org/docs/api.html#config
		baseUrl : 'modules',
		paths : {
			'tools' : '../tools'
		}
	}
} );

TinyCore.AMD.requireAndStart( [ 'todo_form_add', 'todo_list' ], function ( aModulesData )
{
	console.info( aModulesData.length+' module(s) loaded:', aModulesData );
} );
```

**todo_form_add.js :**
```js
TinyCore.AMD.define( 'todo_form_add', ['tools/mediator', 'tools/events'], function ( mediator, events )
{
	return { /* ... */ };
} );
```

**todo_list.js :**
```js
TinyCore.AMD.define( 'todo_list', ['tools/mediator', 'tools/dom', 'tools/events'], function ( mediator, dom, events )
{
	return { /* ... */ };
} );
```

### AMD with DOM boot

#### Features

- Supports a declarative approach : simply by adding the proper "data-" attribute in the markup, modules can be attached to any DOM element. Modules can then be loaded and started from the declarations found in the DOM, on demand.
- Lazy loading based on strategies : by adding the proper "data-" attribute, strategies can be declared for deferring the loading of modules.
- 3 types of strategies are supported : event-based (when a given event occurs on the element where the module is attached), time-based (after xxx milliseconds), distance-based (when the distance between the mouse pointer and the DOM element is less than yyy pixels).
- Loading strategies can be combined (e.g.: event+timer).
- Around 3Kb minified + 15Kb for require.js.

#### Extended TinyCore.AMD API

```js
// existing
TinyCore.AMD.config( settings )
TinyCore.AMD.define( moduleName, dependencies, creatorFunction )
TinyCore.AMD.require( resourcesNames, callback )
TinyCore.AMD.requireAndStart( modulesData, callback )
TinyCore.AMD.setErrorHandler( errorHandler )

// extended
TinyCore.AMD.domBoot( rootNode, callback )
```

#### Examples

See the demos in the "demos/todolist/amd" folder :

- "demos/todolist/amd/index-domboot.html" : declarative approach using "data-" attributes in the markup, without deferred loading strategies.
- "demos/todolist/amd/index-deferred" : same as before, but with several deferred loading strategies.

An example from "demos/todolist/amd/index-deferred.html" :

**app.js :**
```js
TinyCore.AMD.config( {
	require : {
		// see http://requirejs.org/docs/api.html#config
		baseUrl : 'modules',
		paths : {
			'tools' : '../tools'
		}
	}
	domBoot : {
		// node names to ignore when scanning the DOM (must be in capital letters)
		nodesIgnored : { H1 : true, LI : true, A : true }
	}
} );

TinyCore.AMD.domBoot( function ( aModulesData )
{
	console.info( 'DOM boot ok. '+aModulesData.length+' module(s) loaded:', aModulesData );
} );
```

**app.html :**
```html
(...)
<body>
	<div id="container" data-tc-modules="todo_storage" data-tc-defer="time:5000">
		<h1>A todo list (AMD deferred load)</h1>
		<form id="todo-form-add" class="todo-form">
			<input id="add-input" class="todo-input" placeholder="Enter your comma-separated todos..." data-tc-modules='todo_form_add' data-tc-defer="event:click" />
		</form>
		<form id="search-form" class="todo-form">
			<input id="search-input" class="todo-input" placeholder="Quick search..." data-tc-modules="todo_form_search" data-tc-defer="distance:50;time:10000" />
			<a title="reset" href="#" id="search-reset"></a>
		</form>
		<span id="summary" data-tc-modules="todo_summary" data-tc-defer="time:1000">
			<span id="count-done"></span>/<span id="count-total"></span> completed - <a href="#" id="clear-completed" class="clear">clear completed</a> - <a href="#" id="clear-list" class="clear">clear all</a>
		</span>
		<ul id="todo-list" data-tc-modules="todo_list" data-tc-defer="time:1000">
			<li id="list-header">
				<input type="checkbox" class="todo-check-all" id="todo-check-all" />
				<span class="label">Name</span>
			</li>
		</ul>
	</div>
</body>
(...)
```

When calling `TinyCore.AMD.domBoot`, the DOM is scanned for finding modules declarations. The following modules are found and are started as follows :

- "todo_storage", loaded after 5s
- "todo_form_add", loaded when the user will click on the "#add-input" element
- "todo_form_search", loaded when the mouse pointer is closer than 50px or after 10s
- "todo_summary" and "todo_list", loaded after 1s

If no deferred strategies were declared, the modules would have been loaded directly.
