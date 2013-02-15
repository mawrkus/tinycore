/**
 * A basic sandbox with dom and utils.
 */
TinyCore.SandBox.register( 'basic', {
	dom : {
		getById : function ( sID )
		{
			return document.getElementById( sID )
		},
		append : function ( oElem, sHTML)
		{
			oElem.innerHTML += sHTML;
		}
	},
	utils : {
		proxy : function ( fpFunc, oContext )
		{
			return function ()
			{
				fpFunc.apply( oContext, Array.prototype.slice.call( arguments ) );
			}
		}
	}
} );