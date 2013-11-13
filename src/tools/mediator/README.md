## TinyCore.js / Module tools

### The Mediator

#### Features

- The [mediator](http://addyosmani.com/largescalejavascript/#mediatorpattern) tool implements a simple publish/subscribe system, for inter-modules communication.
- Less than 1Kb minified.

#### API

```js
var Mediator = {
	subscribe : function ( topics, handler, context ) {},
	publish : function ( topic, data ) {},
	unsubscribe : function ( topics ) {},
	unsubscribeAll : function () {}
};
```

#### Example

The Mediator can be requested explicitly via `TinyCore.Toolbox.request` :

```js
var Mediator = TinyCore.Toolbox.request( 'mediator' );

Mediator.publish( 'phone:call', { from : '+34123456789' } );
```

Or can be requested by the module, when defined :

```js
TinyCore.Module.define( 'phone', ['mediator'], function ( mediator )
{
	return {
		onStart : function ()
		{
			var self = this;

			mediator.publish( 'phone:boot', { when : +new Date() } );

			mediator.subscribe( 'phone:call', function ( oTopic )
			{
				var oCallData = oTopic.data;
				self.displayMessage( 'Call from '+oCallData.from );
			} );

			// Subscribe to several topics and...
			// ...specify the context in which "onBatteryStateChanged" should be executed.
			mediator.subscribe( ['battery:charged', 'battery:empty'], this.onBatteryStateChanged, this );
		},
		onStop : function ()
		{
			mediator.unsubscribe( ['phone:call', 'battery:charged'] );
			mediator.unsubscribe( 'battery:empty' );
			// mediator.unsubscribeAll();
		},
		onBatteryStateChanged : function ( oTopic )
		{
			var sTopicName = oTopic.name,
				sMsg = sTopicName === 'battery:charged' ?
										'Battery fully charged.' :
										'Battery is empty!';

			this.displayMessage( sMsg );
		},
		displayMessage : function ( sMsg )
		{
			alert( sMsg );
		}
	};
} );
```
