// Add HTML helpers and matchers.
beforeEach( function ()
{
	var nSuiteID = this.suite.id;

	this.prepareHTML = function ()
	{
		/*console.info(this.suite.description);
		console.log('> '+this.description);*/

		var sContainerID = 'suite-'+nSuiteID;
		oSuiteContainer = document.createElement( 'div' );
		oSuiteContainer.id = sContainerID;
		document.body.appendChild( oSuiteContainer );
	};
	this.cleanHTML = function ()
	{
		var sContainerID = 'suite-'+nSuiteID,
			oSuiteContainer = document.getElementById( sContainerID );
		if ( oSuiteContainer )
		{
			oSuiteContainer.parentNode.removeChild( oSuiteContainer );
		}
	};
	this.addHTML = function ( sHTML )
	{
		var sContainerID = 'suite-'+nSuiteID,
			oSuiteContainer = document.getElementById( sContainerID );
		oSuiteContainer.innerHTML += sHTML;
	};

	this.prepareHTML();

	// Additional matchers.
	this.addMatchers( {
		toBeFunction : function ()
		{
			return Object.prototype.toString.call( this.actual ) === '[object Function]';
		},
		toBeObject : function ()
		{
			return Object.prototype.toString.call( this.actual ) === '[object Object]';
		},
		toBeString : function ()
		{
			return Object.prototype.toString.call( this.actual ) === '[object String]';
		}
	} );
});

// Cleanup HTML.
afterEach( function ()
{
	this.cleanHTML();
});
