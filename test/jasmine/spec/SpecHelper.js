beforeEach( function ()
{
	this.addMatchers( {
		toBeFunction : function ()
		{
			return Object.prototype.toString.call( this.actual ) === '[object Function]';
		},
		toBeObject : function ()
		{
			return Object.prototype.toString.call( this.actual ) === '[object Object]';
		}
	} );
});