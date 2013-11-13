/**
 * The (inherited) "widget-text" module.
 *
 * Topics subscribed : "color:preset"
 * Topics published : "color:add"
 */
TinyCore.Module.inherit( 'widget-generic', 'widget-text', ['mediator'], function ( _mediator )
{
	// The module.
	return {
		/**
		 * Topics to automatically subscribe to.
		 * @type {Object}
		 */
		topics : {
			'color:preset' : function ( oTopic )
			{
				this.logActivity( 'widget-text', '"'+oTopic.name+'" received ('+oTopic.data.value+')' );
				this.textInput.value = oTopic.data.text;
			}
		},
		/**
		 * Events to automatically add listeners to.
		 * @type {Object}
		 */
		events : {
			'click button[type=submit]' : function ( eEvent )
			{
				var sValue = this.textInput.value.trim();

				this.logActivity( 'widget-text', 'click on button[type=submit]' );

				eEvent.preventDefault();

				if ( sValue )
				{
					_mediator.publish( 'color:add', { text : sValue } );
					sValue = '';
				}

				this.textInput.value = sValue;
			}
		},
		/**
		 * The text input.
		 * @type {DOM Element}
		 */
		textInput : document.getElementById( 'text-input' ),
		/**
		 * This method is called when the module is started.
		 * @param  {Object} oStartData The start data.
		 */
		onStart : function ( oStartData )
		{
			this.logActivity( 'widget-text', 'onStart' );
			this._super( oStartData );
		},
		/**
		 * This method is called when the module is stopped.
		 */
		onStop : function ()
		{
			this.logActivity( 'widget-text', 'onStop' );
			this._super();
		}
	};
} );
