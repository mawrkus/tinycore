TinyCore.debugMode = true;

var oDummyModule = {
		onStart : function() {},
		onStop : function () {}
	},
	fpDummyCreator = function ( oSandBox )
	{
		return oDummyModule;
	};

/**
 * ------- CORE TESTS -------
 */

describe( 'TinyCore', function ()
{
	it( 'should have an interface with the following methods/properties : debugMode, extend, Module, SandBox, ErrorHandler', function ()
	{
		expect( TinyCore.debugMode ).toBeTruthy();
		expect( TinyCore.extend ).toBeFunction();
		expect( TinyCore.Module ).toBeObject();
		expect( TinyCore.SandBox ).toBeObject();
		expect( TinyCore.ErrorHandler ).toBeObject();
	} );
} );

/**
 * ------- MODULE TESTS -------
 */

describe( 'TinyCore.Module', function ()
{
	it( 'should have an interface with the following methods/properties : register, start, stop, instanciate and getModules', function ()
	{
		expect( TinyCore.Module.register ).toBeFunction();
		expect( TinyCore.Module.start ).toBeFunction();
		expect( TinyCore.Module.stop ).toBeFunction();
		expect( TinyCore.Module.instanciate ).toBeFunction();
		expect( TinyCore.Module.getModules ).toBeFunction();
	} );
} );

describe( 'TinyCore.Module.register', function ()
{
	it( 'should throw an error when trying to register a module without passing a creator function', function ()
	{
		expect( function ()
		{
			TinyCore.Module.register( 'afterburner0' );
		} ).toThrow();
	} );

	it( 'should register properly a module', function ()
	{
		var bResult = TinyCore.Module.register( 'afterburner1', fpDummyCreator );

		expect( bResult ).toBeTruthy();
	} );

	it( 'should not overwrite a module previously registered', function ()
	{
		var bResult = TinyCore.Module.register( 'afterburner2', fpDummyCreator );

		bResult = TinyCore.Module.register( 'afterburner2', fpDummyCreator );;

		expect( bResult ).toBeFalsy();
	} );
} );

describe( 'TinyCore.Module.getModules', function ()
{
	it( 'should return an object', function ()
	{
		expect( TinyCore.Module.getModules() ).toBeObject();
	} );
} );

describe( 'TinyCore.Module.instanciate', function ()
{
	it( 'should throw an error when trying to instanciate a module that is not registered', function ()
	{
		expect( function ()
		{
			TinyCore.Module.instanciate( '!' );
		} ).toThrow();
	} );

	it( 'should instanciate a previously-registered module', function ()
	{
		var oModule = {
			sCypherKey : 'kvbs6E2NSw72sdb903bnjK',
			onStart : function ( oStartData ) {},
			onStop : function () {}
		},
		oTestedModule = null;

		TinyCore.Module.register( 'com-3MHz', function ()
		{
			return oModule;
		} );

		oTestedModule = TinyCore.Module.instanciate( 'com-3MHz' );

		expect( oModule ).toEqual( oTestedModule );
	} );

	it( 'should assign a proper __sandbox__ property to the instanciated module', function ()
	{
		var oModule = null;

		TinyCore.Module.register( 'cockpit', fpDummyCreator );

		oModule = TinyCore.Module.instanciate( 'cockpit' );

		expect( oModule.__sandbox__ ).toBeObject();
		expect( oModule.__sandbox__.subscribe ).toBeFunction();
		expect( oModule.__sandbox__.publish ).toBeFunction();
		expect( oModule.__sandbox__.unSubscribe ).toBeFunction();
		expect( oModule.__sandbox__.unSubscribeAll ).toBeFunction();
	} );

	it( 'should allow the instanciated module\'s sandbox methods to be tested properly', function ()
	{
		var oModule = null;

		TinyCore.Module.register( 'solar-panels', function ( oSandBox )
		{
			return {
				onStart : function ( oStartData )
				{
					oSandBox.subscribe( 'solar-wind', function() {} );
					oSandBox.publish( 'solar-panels-started', { bMinMode : true } );
				},
				onStop : function ()
				{
					oSandBox.unSubscribe( 'solar-wind' );
				}
			}
		} );

		oModule = TinyCore.Module.instanciate( 'solar-panels' );

		spyOn( oModule.__sandbox__, 'subscribe' );
		spyOn( oModule.__sandbox__, 'publish' );
		spyOn( oModule.__sandbox__, 'unSubscribe' );

		oModule.onStart();

		expect( oModule.__sandbox__.subscribe ).toHaveBeenCalled();
		expect( oModule.__sandbox__.publish ).toHaveBeenCalledWith( 'solar-panels-started', { bMinMode : true } );

		oModule.onStop();

		expect( oModule.__sandbox__.unSubscribe ).toHaveBeenCalled();
	} );
} );

describe( 'TinyCore.Module.start', function ()
{
	it( 'should throw an error when trying to start a module that is not registered', function ()
	{
		expect( function ()
		{
			TinyCore.Module.start( '!' );
		} ).toThrow();
	} );

	it( 'should instanciate a module', function ()
	{
		TinyCore.Module.register( 'e-tank', fpDummyCreator );

		spyOn( TinyCore.Module, 'instanciate' ).andReturn( oDummyModule );

		TinyCore.Module.start( 'e-tank' );

		expect( TinyCore.Module.instanciate ).toHaveBeenCalledWith( 'e-tank' );
	} );

	it( 'should start a module properly', function ()
	{
		var oStartData = {
			nCount : 8
		},
		oModule = {
			nCount : 0,
			onStart : function ( oStartData )
			{
				this.nCount = oStartData.nCount;
			}
		};

		TinyCore.Module.register( 'engines', function ( oSandBox )
		{
			return oModule;
		} );

		TinyCore.Module.start( 'engines', oStartData );

		expect( oModule.nCount ).toEqual( 8 );
	} );

	it( 'should not start a module that has already been started', function ()
	{
		var oModule = {
			nCount : 3,
			onStart : function ()
			{
				this.nCount *= 2;
			}
		};

		TinyCore.Module.register( 'antenna', function ( oSandBox )
		{
			return oModule;
		} );

		TinyCore.Module.start( 'antenna' );
		TinyCore.Module.start( 'antenna' );

		expect( oModule.nCount ).toEqual( 6 );
	} );
} );

describe( 'TinyCore.Module.stop', function ()
{
	it( 'should throw an error when trying to stop a module that is not registered', function ()
	{
		expect( function ()
		{
			TinyCore.Module.stop( 'restroom' );
		} ).toThrow();
	} );

	it( 'should stop a module properly', function ()
	{
		var oModule = {
			bContainsO2 : true,
			onStart : function () {},
			onStop : function () {
				this.bContainsO2 = false;
			}
		};

		TinyCore.Module.register( 'atmosphere', function ( oSandBox )
		{
			return oModule;
		} );

		TinyCore.Module.start( 'atmosphere' );

		spyOn( oModule.__sandbox__, 'unSubscribeAll' );

		TinyCore.Module.stop( 'atmosphere' );

		expect( oModule.bContainsO2 ).toBeFalsy();
		expect( oModule.__sandbox__.unSubscribeAll ).toHaveBeenCalled();
	} );

	it( 'should not stop a module that has already been stopped', function ()
	{
		var oModule = {
			nTemp : 21,
			onStart : function () {},
			onStop : function () {
				this.nTemp -= 5;
			}
		};

		TinyCore.Module.register( 'heat', function ( oSandBox )
		{
			return oModule;
		} );

		TinyCore.Module.start( 'heat' );
		TinyCore.Module.stop( 'heat' );
		TinyCore.Module.stop( 'heat' );

		expect( oModule.nTemp ).toEqual( 16 );
	} );
} );

describe( 'TinyCore.Module.start and TinyCore.Module.stop', function ()
{
	it( 'should be able to restart a module that has been stopped', function ()
	{
		var oModule = {
			nStatus : 0,
			onStart : function ()
			{
				this.nStatus++;
			},
			onStop : function ()
			{
				this.nStatus++;
			}
		};

		TinyCore.Module.register( 'shield', function ()
		{
			return oModule;
		} );

		TinyCore.Module.start( 'shield' );
		TinyCore.Module.stop( 'shield' );
		TinyCore.Module.start( 'shield' );

		expect( oModule.nStatus ).toEqual( 3 );
	} );
} );

/**
 * ------- SANDBOX TESTS -------
 */

describe( 'TinyCore.SandBox', function ()
{
	it( 'should have an interface with the following methods/properties : register and build', function ()
	{
		expect( TinyCore.SandBox.register ).toBeFunction();
		expect( TinyCore.SandBox.build ).toBeFunction();
	} );
} );

describe( 'TinyCore.SandBox.build', function ()
{
	var oSandBox = TinyCore.SandBox.build();

	it( 'should build properly a new sandbox having the publish and subscribe methods', function ()
	{
		expect( oSandBox ).toBeObject();
		expect( oSandBox.publish ).toBeFunction();
		expect( oSandBox.subscribe ).toBeFunction();
	} );

	it( 'should build unique sandbox objects', function ()
	{
		expect( oSandBox ).not.toEqual( TinyCore.SandBox.build() );
	} );

	describe( 'A new sandbox, using subscribe and publish', function ()
	{
		var fpHandler = null;

		beforeEach( function ()
		{
			fpHandler = jasmine.createSpy();
			jasmine.Clock.useMock();
		} );

		it( 'should be able to subscribe to and to publish topics', function ()
		{
			var oData = {
				bAllSystemsActive : true,
				nFuelLeft : 88
			};

			oSandBox.subscribe( 'channel:object:action', fpHandler );
			oSandBox.publish( 'channel:object:action', oData );

			jasmine.Clock.tick( 10 ); // Should be enough.

			expect( fpHandler ).toHaveBeenCalledWith( { name : 'channel:object:action', data : oData } );
		} );

		it( 'should be able to subscribe to and to publish multiple topìcs', function ()
		{
			var oData1 = {
					bAllSystemsActive : false,
					nFuelLeft : 27
				},
				oData2 = {
					bAllSystemsActive : false,
					nFuelLeft : 24
				};

			oSandBox.subscribe( ['start-com', 'start-engine'], fpHandler );
			oSandBox.subscribe( 'start-heat', fpHandler );
			oSandBox.publish( 'start-com', oData1 );
			oSandBox.publish( 'start-heat', oData2 );

			jasmine.Clock.tick( 10 ); // Should be enough.

			expect( fpHandler.calls.length ).toEqual( 2 );
			expect( fpHandler.calls[0].args[0] ).toEqual( { name : 'start-com', data : oData1 } );
			expect( fpHandler.calls[1].args[0] ).toEqual( { name : 'start-heat', data : oData2 } );
		} );

		it( 'should not be able to subscribe twice to a topic', function ()
		{
			oSandBox.subscribe( 'reset-lab', fpHandler );
			oSandBox.subscribe( 'reset-lab', fpHandler );
			oSandBox.publish( 'reset-lab' );

			jasmine.Clock.tick( 10 ); // Should be enough.

			expect( fpHandler.calls.length ).toEqual( 1 );
		} );

		it( 'should be able to publish a topic that will be received by another sandbox', function ()
		{
			var oData = {
					bAllSystemsActive : false,
					nFuelLeft : 13
				},
				oOtherSandBox = TinyCore.SandBox.build();

			oOtherSandBox.subscribe( ['stop-com', 'stop-engine', 'stop-heat'], fpHandler );

			oSandBox.publish( 'stop-engine', oData );
			oSandBox.publish( 'stop-heat' );

			jasmine.Clock.tick( 10 ); // Should be enough.

			expect( fpHandler.calls.length ).toEqual( 2 );
			expect( fpHandler.calls[0].args[0] ).toEqual( { name : 'stop-engine', data : oData } );
			expect( fpHandler.calls[1].args[0] ).toEqual( { name : 'stop-heat', data : undefined } );
		} );

		it( 'should be able to subscribe to a topic and to choose the handler context', function ()
		{
			var oFuelSystem = { nFuelLeft : 88 },
				fpDecFuel = function ( oTopic )
				{
					this.nFuelLeft -= oTopic.data.nDecFuel;
				};

			oSandBox.subscribe( 'fuel-down', fpDecFuel, oFuelSystem );
			oSandBox.publish( 'fuel-down', { nDecFuel : 3 } );

			jasmine.Clock.tick( 10 ); // Should be enough.

			expect( oFuelSystem.nFuelLeft ).toEqual( 85 );
		} );
	} );
} );

describe( 'TinyCore.SandBox.unSubscribe', function ()
{
	it( 'should unSubscribe properly from subscribed topics', function ()
	{
		var oSandBox = TinyCore.SandBox.build(),
			fpHandler = jasmine.createSpy();

		jasmine.Clock.useMock();

		oSandBox.subscribe( ['activate-lab', 'enter-green-mode', 'deploy-solar-wings', 'ride-on'], fpHandler );
		oSandBox.unSubscribe( ['activate-lab', 'enter-green-mode'] );
		oSandBox.unSubscribe( 'ride-on' );

		oSandBox.publish( 'activate-lab' );
		oSandBox.publish( 'enter-green-mode' );
		oSandBox.publish( 'deploy-solar-wings' );
		oSandBox.publish( 'ride-on' );

		jasmine.Clock.tick( 10 ); // Should be enough.

		expect( fpHandler.calls.length ).toEqual( 1 );
	} );
} );

describe( 'TinyCore.SandBox.unSubscribeAll', function ()
{
	it( 'should unSubscribe properly from all subscribed topics', function ()
	{
		var oSandBox = TinyCore.SandBox.build(),
			fpHandler = jasmine.createSpy();

		jasmine.Clock.useMock();

		oSandBox.subscribe( ['activate-lab', 'enter-green-mode', 'deploy-solar-wings', 'ride-on'], fpHandler );
		oSandBox.unSubscribeAll();

		oSandBox.publish( 'activate-lab' );
		oSandBox.publish( 'enter-green-mode' );
		oSandBox.publish( 'deploy-solar-wings' );
		oSandBox.publish( 'ride-on' );

		jasmine.Clock.tick( 10 ); // Should be enough.

		expect( fpHandler.calls.length ).toEqual( 0 );
	} );
} );

describe( 'TinyCore.SandBox.register', function ()
{
	it( 'should properly register and create a custom sandbox', function ()
	{
		var oNewSandbox = null,
			bRegistered = TinyCore.SandBox.register( 'devel_env', {
				DOMTools : {
					bind : function () {}
				},
				Constants : {
					url : 'www.module-devel.com',
				},
			} );

		expect( bRegistered ).toBeTruthy();

		oNewSandbox = TinyCore.SandBox.build( 'devel_env' );

		expect( oNewSandbox ).toBeObject();
		expect( oNewSandbox.publish ).toBeFunction();
		expect( oNewSandbox.subscribe ).toBeFunction();
		expect( oNewSandbox.DOMTools ).toBeObject();
		expect( oNewSandbox.DOMTools.bind ).toBeFunction();
		expect( oNewSandbox.Constants ).toBeObject();
		expect( oNewSandbox.Constants.url ).toEqual( 'www.module-devel.com' );
	} );

	it( 'should not be able to register twice the same sandbox type', function ()
	{
		var oNewSandbox = null,
			bRegistered = TinyCore.SandBox.register( 'prod_env', {} );

		expect( bRegistered ).toBeTruthy();

		bRegistered = TinyCore.SandBox.register( 'prod_env', {} );

		expect( bRegistered ).toBeFalsy();
	} );

	it( 'should properly register and build a custom sandbox and provide it to a new module when started', function ()
	{
		var oRyeSandBox = null,
			oDojoSandBox = null,
			oDojoMoves = { onStart:function(){} },
			oCatcherInTheRye = { onStart:function(){} };

		expect( TinyCore.SandBox.register( 'rye_toolkit', {
			name : 'Rye',
			DOMTools : {
				rye : function () {}
			}
		} ) ).toBeTruthy();

		expect( TinyCore.SandBox.register( 'dojo_toolkit', {
			name : 'Dojo',
			DOMTools : {
				dojo : function () {}
			}
		} ) ).toBeTruthy();

		oDojoSandBox = TinyCore.SandBox.build( 'dojo_toolkit' );
		oRyeSandBox = TinyCore.SandBox.build( 'rye_toolkit' );

		expect( oDojoSandBox ).toBeObject();
		expect( oRyeSandBox ).toBeObject();

		TinyCore.Module.register( 'dojo_moves', function ( oSandBox )
		{
			return oDojoMoves;
		}, 'dojo_toolkit' );

		TinyCore.Module.start( 'dojo_moves' );

		TinyCore.Module.register( 'catcher_in_the_rye', function ( oSandBox )
		{
			return oCatcherInTheRye;
		}, 'rye_toolkit' );

		TinyCore.Module.start( 'catcher_in_the_rye' );

		expect( oDojoMoves.__sandbox__.name ).toEqual( 'Dojo' );
		expect( oDojoMoves.__sandbox__.DOMTools.dojo ).toBeFunction();

		expect( oCatcherInTheRye.__sandbox__.name ).toEqual( 'Rye' );
		expect( oCatcherInTheRye.__sandbox__.DOMTools.rye ).toBeFunction();
	} );
} );

/**
 * ------- ERROR HANDLER TESTS -------
 */

describe( 'TinyCore.ErrorHandler', function ()
{
	it( 'should have an interface with the following methods/properties : log', function ()
	{
		expect( TinyCore.ErrorHandler.log ).toBeFunction();
	} );
} );

/**
 * ------- EXTENDED MODULE API TESTS -------
 */

describe( 'TinyCore.Module : extended API', function ()
{
	it( 'should contain these extended methods/properties : instanciate, startAll, stopAll, destroy, destroyAll, isStarted and registerAndStart', function ()
	{
		expect( TinyCore.Module.instanciate ).toBeFunction();
		expect( TinyCore.Module.startAll ).toBeFunction();
		expect( TinyCore.Module.stopAll ).toBeFunction();
		expect( TinyCore.Module.destroy ).toBeFunction();
		expect( TinyCore.Module.isStarted ).toBeFunction();
		expect( TinyCore.Module.registerAndStart ).toBeFunction();
	} );
} );

describe( 'TinyCore.Module.isStarted', function ()
{
	it( 'should return false for an unknown module', function ()
	{
		expect( TinyCore.Module.isStarted( '?' ) ).toBeFalsy();
	} );

	it( 'should return false for an undefined module name', function ()
	{
		expect( TinyCore.Module.isStarted() ).toBeFalsy();
	} );

	it( 'should return false for a registered module that is not started', function ()
	{
		TinyCore.Module.register( 'gyroscope', fpDummyCreator );

		expect( TinyCore.Module.isStarted( 'gyroscope' ) ).toBeFalsy();
	} );

	it( 'should return true for a registered module that is started', function ()
	{
		TinyCore.Module.register( 'zero-g', fpDummyCreator );

		TinyCore.Module.start( 'zero-g' );

		expect( TinyCore.Module.isStarted( 'zero-g' ) ).toBeTruthy();
	} );
} );

describe( 'TinyCore.Module.startAll', function ()
{
	it( 'should start all registered modules properly', function ()
	{
		var oAirFilter1 = {
			nO2Level : 0.1,
			onStart : function ( oStartData )
			{
				this.nO2Level *= 2;
			}
		},
		oAirFilter2 = {
			nO2Level : 0.25,
			onStart : function ( oStartData )
			{
				this.nO2Level *= 3;
			}
		},
		oAirFilter3 = {
			nO2Level : 0.3,
			onStart : function ( oStartData )
			{
				this.nO2Level *= 4;
			}
		};

		TinyCore.Module.register( 'airfilter1', function ( oSandBox )
		{
			return oAirFilter1;
		} );
		TinyCore.Module.register( 'airfilter2', function ( oSandBox )
		{
			return oAirFilter2;
		} );
		TinyCore.Module.register( 'airfilter3', function ( oSandBox )
		{
			return oAirFilter3;
		} );

		TinyCore.Module.startAll();

		expect( oAirFilter1.nO2Level ).toEqual( 0.2 );
		expect( oAirFilter2.nO2Level ).toEqual( 0.75 );
		expect( oAirFilter3.nO2Level ).toEqual( 1.2 );
	} );

	it( 'should start all registered modules passing them properly the related start data', function ()
	{
		var oWheel1 = {
			nPressure : 0.1,
			onStart : function ( oStartData )
			{
				this.nPressure *= oStartData.nCoeff;
			}
		},
		oWheel2 = {
			nPressure : 0.2,
			onStart : function ( oStartData )
			{
				this.nPressure *= 10;
			}
		},
		oWheel3 = {
			nPressure : 0.3,
			onStart : function ( oStartData )
			{
				this.nPressure *= oStartData.nCoeff;
			}
		};

		TinyCore.Module.register( 'wheel1', function ( oSandBox )
		{
			return oWheel1;
		} );
		TinyCore.Module.register( 'wheel2', function ( oSandBox )
		{
			return oWheel2;
		} );
		TinyCore.Module.register( 'wheel3', function ( oSandBox )
		{
			return oWheel3;
		} );

		TinyCore.Module.startAll( {
			'wheel1'  : { nCoeff : 5 },
			'wheel3'  : { nCoeff : 15 }
		} );

		expect( oWheel1.nPressure ).toEqual( 0.5 );
		expect( oWheel2.nPressure ).toEqual( 2 );
		expect( oWheel3.nPressure ).toEqual( 4.5 );
	} );

	it( 'should start all selected modules properly', function ()
	{
		var oWaterFilter1 = {
			nPH : 5,
			onStart : function ( oStartData )
			{
				this.nPH += 1.1;
			}
		},
		oWaterFilter2 = {
			nPH : 7,
			onStart : function ( oStartData )
			{
				this.nPH -= 1.1;
			}
		},
		oWaterFilter3 = {
			nPH : 9,
			onStart : function ( oStartData )
			{
				this.nPH -= 2;
			}
		};

		TinyCore.Module.register( 'waterfilter1', function ( oSandBox )
		{
			return oWaterFilter1;
		} );
		TinyCore.Module.register( 'waterfilter2', function ( oSandBox )
		{
			return oWaterFilter2;
		} );
		TinyCore.Module.register( 'waterfilter3', function ( oSandBox )
		{
			return oWaterFilter3;
		} );

		TinyCore.Module.startAll( ['waterfilter1', 'waterfilter2'] );

		expect( oWaterFilter1.nPH ).toEqual( 6.1 );
		expect( oWaterFilter2.nPH ).toEqual( 5.9 );
		expect( oWaterFilter3.nPH ).toEqual( 9 );
	} );

	it( 'should start all selected modules passing them properly the related start data', function ()
	{
		var oCharger1 = {
			nBatteryLevel : 11,
			onStart : function ( oStartData )
			{
				this.nBatteryLevel += oStartData.nInc;
			}
		},
		oCharger2 = {
			nBatteryLevel : 12,
			onStart : function ( oStartData )
			{
				this.nBatteryLevel += 88;
			}
		},
		oCharger3 = {
			nBatteryLevel : 13,
			onStart : function ( oStartData )
			{
				this.nBatteryLevel += oStartData.nInc;
			}
		};

		TinyCore.Module.register( 'charger1', function ( oSandBox )
		{
			return oCharger1;
		} );
		TinyCore.Module.register( 'charger2', function ( oSandBox )
		{
			return oCharger2;
		} );
		TinyCore.Module.register( 'charger3', function ( oSandBox )
		{
			return oCharger3;
		} );

		TinyCore.Module.startAll( ['charger2', 'charger3'], {
			'charger3'  : { nInc : 25 }
		} );

		expect( oCharger1.nBatteryLevel ).toEqual( 11 );
		expect( oCharger2.nBatteryLevel ).toEqual( 100 );
		expect( oCharger3.nBatteryLevel ).toEqual( 38 );
	} );
} );

describe( 'TinyCore.Module.stopAll', function ()
{
	it( 'should stop all modules', function ()
	{
		var oModules = TinyCore.Module.getModules();

		TinyCore.Module.stopAll();

		for ( sModuleName in oModules )
		{
			expect( TinyCore.Module.isStarted( sModuleName ) ).toBeFalsy();
		}
	} );

	it( 'should stop all selected modules properly', function ()
	{
		var oModules = TinyCore.Module.getModules();

		TinyCore.Module.register( 'gps1', fpDummyCreator );
		TinyCore.Module.register( 'gps2', fpDummyCreator );
		TinyCore.Module.register( 'gps3', fpDummyCreator );

		TinyCore.Module.startAll( ['gps1', 'gps2', 'gps3'] );

		expect( TinyCore.Module.isStarted( 'gps1' ) ).toBeTruthy();
		expect( TinyCore.Module.isStarted( 'gps2' ) ).toBeTruthy();
		expect( TinyCore.Module.isStarted( 'gps3' ) ).toBeTruthy();

		TinyCore.Module.stopAll( ['gps1', 'gps3'] );

		expect( TinyCore.Module.isStarted( 'gps1' ) ).toBeFalsy();
		expect( TinyCore.Module.isStarted( 'gps2' ) ).toBeTruthy();
		expect( TinyCore.Module.isStarted( 'gps3' ) ).toBeFalsy();
	} );

	it( 'should not prevent startAll to restart all stopped modules', function ()
	{
		var oModules = TinyCore.Module.getModules();

		TinyCore.Module.stopAll();

		// Prevent errors from previous tests.
		TinyCore.Module.startAll( {
			'engines' : { nCount : 8 },
			'wheel1' : { nCoeff : 6 },
			'wheel3' : { nCoeff : 7},
			'charger1' : { nInc : 1 },
			'charger3' : { nInc : 0 }
		} );

		for ( sModuleName in oModules )
		{
			expect( TinyCore.Module.isStarted( sModuleName ) ).toBeTruthy();
		}
	} );
} );

describe( 'TinyCore.Module.destroy', function ()
{
	it( 'should throw an error when trying to destroy a module that is not registered', function ()
	{
		expect( function ()
		{
			TinyCore.Module.destroy( 'swimmingpool' );
		} ).toThrow();
	} );

	it( 'should properly stop and destroy a single module', function ()
	{
		var oModules = TinyCore.Module.getModules(),
			fpTemp1Spy = jasmine.createSpy();

		spyOn( TinyCore.Module, 'stop' );

		TinyCore.Module.register( 'temp1', function ( oSandBox )
		{
			return {
				onStart : function () {},
				onDestroy : fpTemp1Spy
			};
		} );
		expect( oModules['temp1'] ).toBeObject();

		TinyCore.Module.start( 'temp1' );
		TinyCore.Module.destroy( 'temp1' );

		expect( TinyCore.Module.stop ).toHaveBeenCalledWith( 'temp1' );
		expect( fpTemp1Spy ).toHaveBeenCalled();
		expect( oModules['temp1'] ).toBeUndefined();
	} );
} );

describe( 'TinyCore.Module.destroyAll', function ()
{
	beforeEach( function ()
	{
		spyOn( TinyCore.Module, 'stop' );
	} );

	it( 'should properly stop and destroy all modules', function ()
	{
		var oModules = TinyCore.Module.getModules();

		TinyCore.Module.register( 'temp2', fpDummyCreator );
		TinyCore.Module.register( 'temp3', fpDummyCreator );
		TinyCore.Module.start( 'temp3' );
		TinyCore.Module.register( 'temp4', fpDummyCreator );

		expect( oModules['temp2'] ).toBeObject();
		expect( oModules['temp3'] ).toBeObject();
		expect( TinyCore.Module.isStarted( 'temp3' ) ).toBeTruthy();
		expect( oModules['temp4'] ).toBeObject();

		TinyCore.Module.destroyAll();

		expect( TinyCore.Module.stop ).toHaveBeenCalledWith( 'temp2' );
		expect( TinyCore.Module.stop ).toHaveBeenCalledWith( 'temp3' );
		expect( TinyCore.Module.stop ).toHaveBeenCalledWith( 'temp4' );

		expect( oModules ).toEqual( {} );
	} );

	it( 'should properly destroy a set of chosen modules', function ()
	{
		var oModules = TinyCore.Module.getModules();

		TinyCore.Module.register( 'temp5', fpDummyCreator );
		TinyCore.Module.register( 'temp6', fpDummyCreator );
		TinyCore.Module.register( 'temp7', fpDummyCreator );

		expect( oModules['temp5'] ).toBeObject();
		expect( oModules['temp6'] ).toBeObject();
		expect( oModules['temp7'] ).toBeObject();

		TinyCore.Module.destroyAll( ['temp5', 'temp7'] );

		expect( TinyCore.Module.stop ).toHaveBeenCalledWith( 'temp5' );
		expect( TinyCore.Module.stop ).not.toHaveBeenCalledWith( 'temp6' );
		expect( TinyCore.Module.stop ).toHaveBeenCalledWith( 'temp7' );

		expect( oModules['temp5'] ).toBeUndefined();
		expect( oModules['temp6'] ).toBeObject();
		expect( oModules['temp7'] ).toBeUndefined();
	} );
} );

describe( 'TinyCore.Module.registerAndStart', function ()
{
	it( 'should register and start a module properly', function ()
	{
		var fpCreator = fpDummyCreator;

		spyOn( TinyCore.Module, 'register' ).andReturn( true );
		spyOn( TinyCore.Module, 'start' );

		TinyCore.Module.registerAndStart( 'ism1', fpCreator );

		expect( TinyCore.Module.register ).toHaveBeenCalledWith( 'ism1', fpCreator, undefined );
		expect( TinyCore.Module.start ).toHaveBeenCalledWith( 'ism1', null );
	} );

	it( 'should not start a module if the registration failed', function ()
	{
		var fpCreator = fpDummyCreator;

		spyOn( TinyCore.Module, 'register' ).andReturn( false );
		spyOn( TinyCore.Module, 'start' );

		TinyCore.Module.register( 'ism2', fpCreator );
		TinyCore.Module.registerAndStart( 'ism2', fpCreator );

		expect( TinyCore.Module.register ).toHaveBeenCalledWith( 'ism2', fpCreator );
		expect( TinyCore.Module.start ).not.toHaveBeenCalled();
	} );
} );

describe( 'TinyCore.Module.instanciate', function ()
{
	it( 'should enable automatic topics subscriptions', function ()
	{
		var fpTooLowSpy = jasmine.createSpy(),
			fpTooHighSpy = jasmine.createSpy(),
			oSandBox = TinyCore.SandBox.build();

		jasmine.Clock.useMock();

		TinyCore.Module.register( 'fridge', function ( oSandBox )
		{
			return {
				onStart : function () {},
				onStop : function () {},
				topics : {
					'temperature:too-low' : fpTooLowSpy,
					'temperature:too-high' : fpTooHighSpy
				}
			};
		} );

		TinyCore.Module.instanciate( 'fridge' );
		oSandBox.publish( 'temperature:too-low' );
		oSandBox.publish( 'temperature:too-high' );

		jasmine.Clock.tick( 10 ); // Should be enough.

		expect( fpTooLowSpy ).toHaveBeenCalled();
		expect( fpTooHighSpy ).toHaveBeenCalled();
	} );
} );

/**
 * ------- AMD MODULES + REQUIRE TESTS -------
 */

describe( 'TinyCore.AMD', function ()
{
	it( 'should have an interface with the following methods/properties : config, register and registerAndStart', function ()
	{
		expect( TinyCore.AMD ).toBeObject();
		expect( TinyCore.AMD.config ).toBeFunction();
		expect( TinyCore.AMD.register ).toBeFunction();
		expect( TinyCore.AMD.registerAndStart ).toBeFunction();
	} );
} );

describe( 'TinyCore.AMD.config', function ()
{
	it( 'should call require.config properly', function ()
	{
		var oSettings = {
			baseUrl : '../../foo'
		};

		spyOn( require, 'config' );

		TinyCore.AMD.config( oSettings );

		expect( require.config ).toHaveBeenCalledWith( oSettings );
	} );
} );

describe( 'TinyCore.AMD.register', function ()
{
	it( 'should properly register the modules using require and then execute the final callback', function ()
	{
		var fpCallback = jasmine.createSpy();

		spyOn( TinyCore.Module, 'register' );

		TinyCore.AMD.register( ['foo', 'bar'], fpCallback );

		expect( TinyCore.Module.register.calls.length ).toEqual( 2 );

		expect( TinyCore.Module.register.calls[0].args[0] ).toEqual( 'foo' );
		expect( TinyCore.Module.register.calls[0].args[1] ).toEqual( window.require.AMDCreators[0] ); // See fake-require.js

		expect( TinyCore.Module.register.calls[1].args[0] ).toEqual( 'bar' );
		expect( TinyCore.Module.register.calls[1].args[1] ).toEqual( window.require.AMDCreators[1] );

		expect( fpCallback ).toHaveBeenCalled();
	} );
} );

describe( 'TinyCore.AMD.registerAndStart', function ()
{
	it( 'should properly register and start the modules using require and then execute the final callback', function ()
	{
		var oStartData2 = { b : 2, c : 3 },
			fpCallback = jasmine.createSpy();

		spyOn( TinyCore.Module, 'register' );
		spyOn( TinyCore.Module, 'start' );

		TinyCore.AMD.registerAndStart( ['baz', 'qux'], { 'qux' : oStartData2 }, fpCallback );

		expect( TinyCore.Module.register.calls.length ).toEqual( 2 );

		expect( TinyCore.Module.register.calls[0].args[0] ).toEqual( 'baz' );
		expect( TinyCore.Module.register.calls[0].args[1] ).toEqual( window.require.AMDCreators[0] ); // See fake-require.js
		expect( TinyCore.Module.start.calls[0].args[0] ).toEqual( 'baz' );
		expect( TinyCore.Module.start.calls[0].args[1] ).toBeUndefined();

		expect( TinyCore.Module.register.calls[1].args[0] ).toEqual( 'qux' );
		expect( TinyCore.Module.register.calls[1].args[1] ).toEqual( window.require.AMDCreators[1] );
		expect( TinyCore.Module.start.calls[1].args[0] ).toEqual( 'qux' );
		expect( TinyCore.Module.start.calls[1].args[1] ).toEqual( oStartData2 );

		expect( fpCallback ).toHaveBeenCalled();
	} );
} );