/**
 * The (inherited) "widget-select" module.
 *
 * Topics subscribed : "color:add"
 * Topics published : "color:preset"
 */
TinyCore.Module.inherit( 'widget-generic', 'widget-select', ['mediator'], function ( _mediator )
{
	// The module.
	return {
		/**
		 * Topics to automatically subscribe to.
		 * @type {Object}
		 */
		topics : {
			'color:add' : function ( oTopic )
			{
				var sNewOptionValue = oTopic.data.text.toLowerCase(),
					sNewOption = sNewOptionValue.charAt( 0 ).toUpperCase() + sNewOptionValue.slice( 1 ),
					oNewOption = document.createElement( 'option' );

				this.logActivity( 'widget-select', '"'+oTopic.name+'" received ('+oTopic.data.text+')' );

				oNewOption.value = sNewOptionValue;
				oNewOption.text = sNewOption;
				this.select.appendChild( oNewOption );
			}
		},
		/**
		 * Events to automatically add listeners to.
		 * @type {Object}
		 */
		events : {
			'change select' : function ( eEvent )
			{
				var oSelectedOption = this.select.options[this.select.selectedIndex],
					sText = oSelectedOption.value !== '' ? oSelectedOption.text : '';

				this.logActivity( 'widget-select', 'change on select' );

				_mediator.publish( 'color:preset', {
					value : oSelectedOption.value,
					text : sText
				} );
			}
		},
		/**
		 * The select.
		 * @type {DOM Element}
		 */
		select : document.getElementById( 'select-input' ),
		/**
		 * This method is called when the module is started.
		 * @param  {Object} oStartData The start data.
		 */
		onStart : function ( oStartData )
		{
			this.logActivity( 'widget-select', 'onStart' );
			this._super( oStartData );
		},
		/**
		 * This method is called when the module is stopped.
		 */
		onStop : function ()
		{
			this.logActivity( 'widget-select', 'onStop' );
			this._super();
		}
	};
} );
