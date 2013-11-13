// Don't catch errors.
TinyCore.debugMode = true;

/**
 * ------- AMD MODULES + DOM BOOT TESTS -------
 */

describe( 'TinyCore.AMD', function ()
{
	it( 'should have an interface with the following methods/properties : domBoot', function ()
	{
		expect( TinyCore.AMD.domBoot ).toBeFunction();
	} );
} );

describe( 'TinyCore.AMD.domBoot', function ()
{
	beforeEach( function ()
	{
		spyOn( TinyCore.AMD, 'requireAndStart' );
	} );

	it( 'should find all the modules declared in the entire DOM and start them properly', function ()
	{
		var aHTML = [],
			fpCallback = function () {},
			aExpectedModulesData;

		aHTML.push( '<div data-tc-modules="module1" id="m-1">' );
			aHTML.push( '<p data-tc-modules="module2;module3;" id="m-23"></p>' );
			aHTML.push( '<span data-tc-modules="   module4   " id="m-4"></span>' );
			aHTML.push( '<div id="m-5678">' );
				aHTML.push( '<a href="#" data-tc-modules=\'module5 ; module6:{"id":"#6"}\' id="m-56"></a>' );
				aHTML.push( '<div>' );
					aHTML.push( '<span data-tc-modules=";module7" id="m-7"></a>' );
				aHTML.push( '</div>' );
				aHTML.push( '<a href="#" data-tc-modules="module8" id="m-8"></a>' );
			aHTML.push( '</div>' );
			aHTML.push( '<span data-tc-modules=\'module9 : {"testing" : true, "offline":false,"log":{"items":[]}};module10;module11:{"last":"one"}\' id="m-910"></span>' );
		aHTML.push( '</div>' );

		this.addHTML( aHTML.join( '' ) );

		aExpectedModulesData = [
			{ name : 'module1', startData : { element : document.getElementById( 'm-1' ) } },
			{ name : 'module2', startData : { element : document.getElementById( 'm-23' ) } },
			{ name : 'module3', startData : { element : document.getElementById( 'm-23' ) } },
			{ name : 'module4', startData : { element : document.getElementById( 'm-4' ) } },
			{ name : 'module5', startData : { element : document.getElementById( 'm-56' ) } },
			{ name : 'module6', startData : { id : '#6', element : document.getElementById( 'm-56' ) } },
			{ name : 'module7', startData : { element : document.getElementById( 'm-7' ) } },
			{ name : 'module8', startData : { element : document.getElementById( 'm-8' ) } },
			{ name : 'module9', startData : { testing : true, offline : false, log : { items : [] }, element : document.getElementById( 'm-910' ) } },
			{ name : 'module10', startData : { element : document.getElementById( 'm-910' ) } },
			{ name : 'module11', startData : { last : 'one', element : document.getElementById( 'm-910' ) } }
		];

		TinyCore.AMD.domBoot( fpCallback );

		expect( TinyCore.AMD.requireAndStart.calls.length ).toBe( 1 );
		expect( TinyCore.AMD.requireAndStart ).toHaveBeenCalledWith( aExpectedModulesData, fpCallback );
	} );

	it( 'should find all the modules declared in the DOM element specified as parameter and start them properly', function ()
	{
		var aHTML = [],
			fpCallback = function () {},
			aExpectedModulesData;

		aHTML.push( '<div data-tc-modules="module1" id="m-1">' );
			aHTML.push( '<p data-tc-modules="module2; module3" id="m-23"></p>' );
			aHTML.push( '<span data-tc-modules="module4" id="m-4"></span>' );
			aHTML.push( '<div id="m-5678">' );
				aHTML.push( '<a href="#" data-tc-modules=\' module5   ; module6:{"id":"#6"}    \' id="m-56"></a>' );
				aHTML.push( '<div>' );
					aHTML.push( '<span data-tc-modules="module7" id="m-7"></a>' );
				aHTML.push( '</div>' );
				aHTML.push( '<a href="#" data-tc-modules="module8" id="m-8"></a>' );
			aHTML.push( '</div>' );
			aHTML.push( '<span data-tc-modules=\'module9 : {"testing":true}\' id="m-9"></span>' );
		aHTML.push( '</div>' );

		this.addHTML( aHTML.join( '' ) );

		aExpectedModulesData = [
			{ name : 'module5', startData : { element : document.getElementById( 'm-56' ) } },
			{ name : 'module6', startData : { id : '#6', element : document.getElementById( 'm-56' ) } },
			{ name : 'module7', startData : { element : document.getElementById( 'm-7' ) } },
			{ name : 'module8', startData : { element : document.getElementById( 'm-8' ) } }
		];

		TinyCore.AMD.domBoot( document.getElementById( 'm-5678' ), fpCallback );

		expect( TinyCore.AMD.requireAndStart.calls.length ).toBe( 1 );
		expect( TinyCore.AMD.requireAndStart ).toHaveBeenCalledWith( aExpectedModulesData, fpCallback );
	} );

	it( 'should take into account the "nodesIgnored" config to find all the modules and start them properly', function ()
	{
		var aHTML = [],
			fpCallback = function () {},
			aExpectedModulesData;

		aHTML.push( '<div data-tc-modules="module1" id="m-1">' );
			aHTML.push( '<p data-tc-modules="module2; module3" id="m-23"></p>' );
			aHTML.push( '<span data-tc-modules="module4" id="m-4"></span>' );
			aHTML.push( '<div id="m-5678">' );
				aHTML.push( '<a href="#" data-tc-modules=\' module5   ; module6:{"id":"#6"}    \' id="m-56"></a>' );
				aHTML.push( '<div>' );
					aHTML.push( '<span data-tc-modules="module7" id="m-7"></a>' );
				aHTML.push( '</div>' );
				aHTML.push( '<a href="#" data-tc-modules="module8" id="m-8"></a>' );
			aHTML.push( '</div>' );
			aHTML.push( '<span data-tc-modules=\'module9 : {"testing":true}\' id="m-9"></span>' );
		aHTML.push( '</div>' );

		this.addHTML( aHTML.join( '' ) );

		aExpectedModulesData = [
			{ name : 'module5', startData : { element : document.getElementById( 'm-56' ) } },
			{ name : 'module6', startData : { id : '#6', element : document.getElementById( 'm-56' ) } },
			{ name : 'module8', startData : { element : document.getElementById( 'm-8' ) } }
		];

		TinyCore.AMD.config( { domBoot : { nodesIgnored : { DIV : true, P : true, SPAN : true } } } );
		TinyCore.AMD.domBoot( fpCallback );
		TinyCore.AMD.config( { domBoot : { nodesIgnored : { DIV : false, P : false, SPAN : false } } } );

		expect( TinyCore.AMD.requireAndStart.calls.length ).toBe( 1 );
		expect( TinyCore.AMD.requireAndStart ).toHaveBeenCalledWith( aExpectedModulesData, fpCallback );
	} );

	it( 'should throw errors each time the JSON parsing of the module\'s "startData" fails', function ()
	{
		this.addHTML( '<div id="m-1" data-tc-modules=\'this-module:{""}\' />' );
		expect( function ()
		{
			TinyCore.AMD.domBoot( document.getElementById( 'm-1' ) );
		} ).toThrow();

		this.addHTML( '<div id="m-2" data-tc-modules=\'this-module:{a:""}\' />' );
		expect( function ()
		{
			TinyCore.AMD.domBoot( document.getElementById( 'm-2' ) );
		} ).toThrow();

		this.addHTML( '<div id="m-3" data-tc-modules=\'this-module:{a":""}\' />' );
		expect( function ()
		{
			TinyCore.AMD.domBoot( document.getElementById( 'm-3' ) );
		} ).toThrow();

		this.addHTML( '<div id="m-4" data-tc-modules=\'this-module:{"a":"}\' />' );
		expect( function ()
		{
			TinyCore.AMD.domBoot( document.getElementById( 'm-4' ) );
		} ).toThrow();

		this.addHTML( '<div id="m-5" data-tc-modules=\'this-module:{"a":true,1,}\' />' );
		expect( function ()
		{
			TinyCore.AMD.domBoot( document.getElementById( 'm-5' ) );
		} ).toThrow();
	} );

	it( 'should defer the load and start of the modules, as declared in the markup', function ()
	{
		var aHTML = [],
			fpCallback = function () {},
			aExpectedModulesData;

		jasmine.Clock.useMock();

		aHTML.push( '<div>' );
			aHTML.push( '<p data-tc-modules="module2" data-tc-defer="time:1000" id="m-2"></p>' );
			aHTML.push( '<span data-tc-modules="module4" id="m-4"></span>' );
			aHTML.push( '<div id="m-5678">' );
				aHTML.push( '<a href="#" data-tc-modules=\' module5   ; module6:{"id":"#6"}    \' data-tc-defer="time:1000" id="m-56"></a>' );
				aHTML.push( '<div>' );
					aHTML.push( '<span data-tc-modules="module7" id="m-7"></a>' );
				aHTML.push( '</div>' );
			aHTML.push( '</div>' );
		aHTML.push( '</div>' );

		this.addHTML( aHTML.join( '' ) );

		aExpectedModulesData = [
			{ name : 'module4', startData : { element : document.getElementById( 'm-4' ) } },
			{ name : 'module7', startData : { element : document.getElementById( 'm-7' ) } }
		];

		TinyCore.AMD.domBoot( fpCallback );

		expect( TinyCore.AMD.requireAndStart.calls.length ).toBe( 1 );
		expect( TinyCore.AMD.requireAndStart ).toHaveBeenCalledWith( aExpectedModulesData, fpCallback );

		jasmine.Clock.tick( 1250 ); // Should be enough.

		aExpectedModulesData = [
			{ name : 'module2', startData : { element : document.getElementById( 'm-2' ) } },
			{ name : 'module5', startData : { element : document.getElementById( 'm-56' ) } },
			{ name : 'module6', startData : { id : '#6', element : document.getElementById( 'm-56' ) } }
		];

		expect( TinyCore.AMD.requireAndStart.calls.length ).toBe( 2 );
		expect( TinyCore.AMD.requireAndStart.calls[1].args[0] ).toEqual( aExpectedModulesData );
		expect( TinyCore.AMD.requireAndStart.calls[1].args[1] ).toEqual( fpCallback );
	} );
} );
