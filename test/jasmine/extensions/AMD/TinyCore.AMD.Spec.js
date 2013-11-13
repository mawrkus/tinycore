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
			require : {
				baseUrl : '../../foo'
			}
		};

		spyOn( require, 'config' );

		TinyCore.AMD.config( oSettings );

		expect( require.config ).toHaveBeenCalledWith( oSettings.require );
	} );

	it( 'should return the current configuration if no parameter is passed', function ()
	{
		var oSettings = {
			require : {
				baseUrl : '../../bar'
			}
		};

		TinyCore.AMD.config( oSettings );

		expect( TinyCore.AMD.config() ).toEqual( oSettings );
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
	it( 'should call the require() function from require.js properly', function ()
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
		var aModulesData = [
				{ name : 'red', startData : { light : true } },
				'green',
				{ name : 'blue', startData : { dark : false } }
			],
			fpCallback = jasmine.createSpy();

		spyOn( TinyCore.AMD, 'require' ).andCallThrough();
		spyOn( TinyCore.Module, 'start' );

		TinyCore.AMD.requireAndStart( aModulesData, fpCallback );

		expect( TinyCore.AMD.require.calls.length ).toBe( 1 );
		expect( TinyCore.AMD.require.calls[0].args[0] ).toEqual( ['red', 'green', 'blue'] );

		expect( TinyCore.Module.start.calls.length ).toBe( 3 );
		expect( TinyCore.Module.start.calls[0].args[0] ).toBe( aModulesData[0].name );
		expect( TinyCore.Module.start.calls[0].args[1] ).toBe( aModulesData[0].startData );
		expect( TinyCore.Module.start.calls[1].args[0] ).toBe( 'green' );
		expect( TinyCore.Module.start.calls[1].args[1] ).toEqual( {} );
		expect( TinyCore.Module.start.calls[2].args[0] ).toBe( aModulesData[2].name );
		expect( TinyCore.Module.start.calls[2].args[1] ).toBe( aModulesData[2].startData );

		expect( fpCallback ).toHaveBeenCalled();
	} );
} );