window.define = function ( sModuleName, aDependencies, fpCreator )
{
	fpCreator.apply( null, aDependencies );
};

window.require = function ( aModulesNames, fpCallback )
{
	fpCallback.apply( null, aModulesNames );
};

window.require.config = function () {};
