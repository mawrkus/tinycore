window.define = function () {};

window.require = function ( aModulesNames, fpCallback )
{
	var nIndex = aModulesNames.length;

	window.require.AMDCreators = [];

	while ( nIndex-- )
	{
		window.require.AMDCreators.push( jasmine.createSpy() );
	}

	fpCallback.apply( this, window.require.AMDCreators );	
};

window.require.config = function () {};