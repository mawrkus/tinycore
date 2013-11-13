// Don't catch errors.
TinyCore.debugMode = true;

/**
 * ------- AMD MODULES + REQUIRE TESTS -------
 */

describe( 'TinyCore.AMD', function ()
{
	it( 'should have an interface with the following methods/properties : config, setErrorHandler, define, require, requireAndStart', function ()
	{
		expect( TinyCore.AMD ).toBeObject();
		expect( TinyCore.AMD.config ).toBeFunction();
		expect( TinyCore.AMD.setErrorHandler ).toBeFunction();
		expect( TinyCore.AMD.define ).toBeFunction();
		expect( TinyCore.AMD.require ).toBeFunction();
		expect( TinyCore.AMD.requireAndStart ).toBeFunction();
	} );
} );

describe( 'TinyCore.AMD.config', function ()
{
	it( 'should call config() from require.js properly', function ()
	{
		var oSettings = {
			baseUrl : '../../foo'
		};

		spyOn( require, 'config' );

		TinyCore.AMD.config( oSettings );

		expect( require.config ).toHaveBeenCalledWith( oSettings );
	} );
} );

describe( 'TinyCore.AMD.setErrorHandler', function ()
{
	it( 'should set the require.js onError() handler properly', function ()
	{
		var fpErrorLog = function () {};

		TinyCore.AMD.setErrorHandler( fpErrorLog );

		expect( require.onError ).toBe( fpErrorLog );
	} );
} );

describe( 'TinyCore.AMD.define', function ()
{
	it( 'should define the module using require.js and then define it properly using TinyCore', function ()
	{
		var sModuleName = 'foo',
			aModuleDeps = ['bar', 'other/baz'],
			oModule = {},
			fpModuleCreator = jasmine.createSpy().andReturn( oModule ),
			aModuleDepsBaseNames = ['bar', 'baz'];

		spyOn( window, 'define' ).andCallThrough();
		spyOn( TinyCore.Module, 'define' );

		TinyCore.AMD.define( sModuleName, aModuleDeps, fpModuleCreator );

		expect( window.define ).toHaveBeenCalled();
		expect( window.define.calls[0].args[0] ).toBe( sModuleName );
		expect( window.define.calls[0].args[1] ).toBe( aModuleDeps );

		expect( TinyCore.Module.define ).toHaveBeenCalled();
		expect( TinyCore.Module.define.calls[0].args[0] ).toBe( sModuleName );
		expect( TinyCore.Module.define.calls[0].args[1] ).toEqual( aModuleDepsBaseNames );
		expect( TinyCore.Module.define.calls[0].args[2] ).toBe( fpModuleCreator );
	} );
} );

describe( 'TinyCore.AMD.require', function ()
{
	it( 'should call the require.js require() function properly', function ()
	{
		var aModuleNames = ['init', 'start', 'go'],
			fpCallback = jasmine.createSpy();

		spyOn( window, 'require' ).andCallThrough();

		TinyCore.AMD.require( aModuleNames, fpCallback );

		expect( window.require ).toHaveBeenCalled();
		expect( window.require.calls[0].args[0] ).toBe( aModuleNames );
		expect( fpCallback ).toHaveBeenCalledWith( 'init', 'start', 'go' );
	} );
} );

describe( 'TinyCore.AMD.requireAndStart', function ()
{
	it( 'should properly require and start the modules using require.js and TinyCore', function ()
	{
		var oModulesData = {
				'red' : {
					startData : { light : true }
				},
				'blue' : {
					startData : { dark : false }
				}
			},
			aModules2Load = ['red', 'blue'],
			fpCallback = jasmine.createSpy();

		spyOn( TinyCore.AMD, 'require' ).andCallThrough();
		spyOn( TinyCore.Module, 'start' );

		TinyCore.AMD.requireAndStart( oModulesData, fpCallback );

		expect( TinyCore.AMD.require.calls.length ).toBe( 1 );
		expect( TinyCore.AMD.require.calls[0].args[0] ).toEqual( aModules2Load );

		expect( TinyCore.Module.start.calls.length ).toBe( aModules2Load.length );
		expect( TinyCore.Module.start.calls[0].args[0] ).toBe( aModules2Load[0] );
		expect( TinyCore.Module.start.calls[0].args[1] ).toBe( oModulesData[aModules2Load[0]].startData );
		expect( TinyCore.Module.start.calls[1].args[0] ).toBe( aModules2Load[1] );
		expect( TinyCore.Module.start.calls[1].args[1] ).toBe( oModulesData[aModules2Load[1]].startData );

		expect( fpCallback ).toHaveBeenCalled();
	} );
} );
