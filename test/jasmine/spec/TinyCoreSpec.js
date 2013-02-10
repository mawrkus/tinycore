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
	it( 'the interface should contain some properties : extend, register, start, stop, instanciate, getModules, SandBox, ErrorHandler and debugMode', function ()
	{
		expect( TinyCore.extend ).toBeFunction();
		expect( TinyCore.register ).toBeFunction();
		expect( TinyCore.start ).toBeFunction();
		expect( TinyCore.stop ).toBeFunction();
		expect( TinyCore.instanciate ).toBeFunction();
		expect( TinyCore.getModules ).toBeFunction();
		expect( TinyCore.SandBox ).toBeObject();
		expect( TinyCore.ErrorHandler ).toBeObject();
		expect( TinyCore.debugMode ).toBeFalsy();
	} );
} );

describe( 'TinyCore.register', function ()
{
	it( 'should register properly a module', function ()
	{
		var bResult = TinyCore.register( 'afterburner1', fpDummyCreator );

		expect( bResult ).toBeTruthy();
	} );

	it( 'should not overwrite a module previously registered', function ()
	{
		var bResult = TinyCore.register( 'afterburner2', fpDummyCreator );

		bResult = TinyCore.register( 'afterburner2', fpDummyCreator );;

		expect( bResult ).toBeFalsy();
	} );
} );

describe( 'TinyCore.getModules', function ()
{
	it( 'should return an object', function ()
	{
		expect( TinyCore.getModules() ).toBeObject();
	} );
} );

describe( 'TinyCore.instanciate', function ()
{
	it( 'should throw an error when trying to instanciate a module that is not registered', function ()
	{
		expect( function ()
		{
			TinyCore.instanciate( '!' );
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

		TinyCore.register( 'com-3MHz', function ()
		{
			return oModule;
		} );

		oTestedModule = TinyCore.instanciate( 'com-3MHz' );

		expect( oModule ).toEqual( oTestedModule );
	} );

	it( 'should assign a proper __sandbox__ property to the instanciated module', function ()
	{
		var oModule = null;

		TinyCore.register( 'cockpit', fpDummyCreator );

		oModule = TinyCore.instanciate( 'cockpit' );

		expect( oModule.__sandbox__ ).toBeObject();
		expect( oModule.__sandbox__.subscribe ).toBeFunction();
		expect( oModule.__sandbox__.publish ).toBeFunction();
		expect( oModule.__sandbox__.unSubscribe ).toBeFunction();
		expect( oModule.__sandbox__.unSubscribeAll ).toBeFunction();
	} );

	it( 'should allow the instanciated module\'s sandbox methods to be tested properly', function ()
	{
		var oModule = null;

		TinyCore.register( 'solar-panels', function ( oSandBox )
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

		oModule = TinyCore.instanciate( 'solar-panels' );

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

describe( 'TinyCore.start', function ()
{
	it( 'should throw an error when trying to start a module that is not registered', function ()
	{
		expect( function ()
		{
			TinyCore.start( '!' );
		} ).toThrow();
	} );

	it( 'should instanciate a module', function ()
	{
		TinyCore.register( 'e-tank', fpDummyCreator );

		spyOn( TinyCore, 'instanciate' ).andReturn( oDummyModule );

		TinyCore.start( 'e-tank' );

		expect( TinyCore.instanciate ).toHaveBeenCalledWith( 'e-tank' );
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

		TinyCore.register( 'engines', function ( oSandBox )
		{
			return oModule;
		} );

		TinyCore.start( 'engines', oStartData );

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

		TinyCore.register( 'antenna', function ( oSandBox )
		{
			return oModule;
		} );

		TinyCore.start( 'antenna' );
		TinyCore.start( 'antenna' );

		expect( oModule.nCount ).toEqual( 6 );
	} );
} );

describe( 'TinyCore.stop', function ()
{
	it( 'should throw an error when trying to stop a module that is not registered', function ()
	{
		expect( function ()
		{
			TinyCore.stop( 'restroom' );
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

		TinyCore.register( 'atmosphere', function ( oSandBox )
		{
			return oModule;
		} );

		TinyCore.start( 'atmosphere' );

		spyOn( oModule.__sandbox__, 'unSubscribeAll' );

		TinyCore.stop( 'atmosphere' );

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

		TinyCore.register( 'heat', function ( oSandBox )
		{
			return oModule;
		} );

		TinyCore.start( 'heat' );
		TinyCore.stop( 'heat' );
		TinyCore.stop( 'heat' );

		expect( oModule.nTemp ).toEqual( 16 );
	} );
} );

describe( 'TinyCore.start and TinyCore.stop', function ()
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

		TinyCore.register( 'shield', function ()
		{
			return oModule;
		} );

		TinyCore.start( 'shield' );
		TinyCore.stop( 'shield' );
		TinyCore.start( 'shield' );

		expect( oModule.nStatus ).toEqual( 3 );
	} );
} );

/**
 * ------- SANDBOX TESTS -------
 */

describe( 'TinyCore.SandBox', function ()
{
	it( 'the interface should contain some properties : create and register', function ()
	{
		expect( TinyCore.SandBox.create ).toBeFunction();
		expect( TinyCore.SandBox.register ).toBeFunction();
	} );
} );

describe( 'TinyCore.SandBox.create', function ()
{
	var oSandBox = TinyCore.SandBox.create();

	it( 'should create properly a new sandbox having the publish and subscribe methods', function ()
	{
		expect( oSandBox ).toBeObject();
		expect( oSandBox.publish ).toBeFunction();
		expect( oSandBox.subscribe ).toBeFunction();
	} );

	it( 'should create unique sandbox objects', function ()
	{
		expect( oSandBox ).not.toEqual( TinyCore.SandBox.create() );
	} );

	describe( 'subscribe and publish', function ()
	{
		var fpHandler = null;

		beforeEach( function ()
		{
			fpHandler = jasmine.createSpy();
			jasmine.Clock.useMock();
		} );

		it( 'the new sandbox should be able to subscribe to and to publish events', function ()
		{
			var oData = {
				bAllSystemsActive : true,
				nFuelLeft : 88
			};

			oSandBox.subscribe( 'channel:object:action', fpHandler );
			oSandBox.publish( 'channel:object:action', oData );

			jasmine.Clock.tick( 10 ); // Should be enough.

			expect( fpHandler ).toHaveBeenCalledWith( { type : 'channel:object:action', data : oData } );
		} );

		it( 'the new sandbox should be able to subscribe to and to publish multiple events', function ()
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
			expect( fpHandler.calls[0].args[0] ).toEqual( { type : 'start-com', data : oData1 } );
			expect( fpHandler.calls[1].args[0] ).toEqual( { type : 'start-heat', data : oData2 } );
		} );

		it( 'the new sandbox should not be able to subscribe twice to an event', function ()
		{
			oSandBox.subscribe( 'reset-lab', fpHandler );
			oSandBox.subscribe( 'reset-lab', fpHandler );
			oSandBox.publish( 'reset-lab' );

			jasmine.Clock.tick( 10 ); // Should be enough.

			expect( fpHandler.calls.length ).toEqual( 1 );
		} );

		it( 'the new sandbox should be able to publish an event that will be received by another sandbox', function ()
		{
			var oData = {
					bAllSystemsActive : false,
					nFuelLeft : 13
				},
				oOtherSandBox = TinyCore.SandBox.create();

			oOtherSandBox.subscribe( ['stop-com', 'stop-engine', 'stop-heat'], fpHandler );

			oSandBox.publish( 'stop-engine', oData );
			oSandBox.publish( 'stop-heat' );

			jasmine.Clock.tick( 10 ); // Should be enough.

			expect( fpHandler.calls.length ).toEqual( 2 );
			expect( fpHandler.calls[0].args[0] ).toEqual( { type : 'stop-engine', data : oData } );
			expect( fpHandler.calls[1].args[0] ).toEqual( { type : 'stop-heat', data : undefined } );
		} );
	} );
} );

describe( 'TinyCore.SandBox.unSubscribe', function ()
{
	it( 'should unSubscribe properly from subscribed events', function ()
	{
		var oSandBox = TinyCore.SandBox.create(),
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
	it( 'should unSubscribe properly from all subscribed events', function ()
	{
		var oSandBox = TinyCore.SandBox.create(),
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

		oNewSandbox = TinyCore.SandBox.create( 'devel_env' );

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

	it( 'should properly register and create a custom sandbox and provide it to a new module when started', function ()
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

		oDojoSandBox = TinyCore.SandBox.create( 'dojo_toolkit' );
		oRyeSandBox = TinyCore.SandBox.create( 'rye_toolkit' );

		expect( oDojoSandBox ).toBeObject();
		expect( oRyeSandBox ).toBeObject();

		TinyCore.register( 'dojo_moves', function ( oSandBox )
		{
			return oDojoMoves;
		}, 'dojo_toolkit' );
		TinyCore.start( 'dojo_moves' );

		TinyCore.register( 'catcher_in_the_rye', function ( oSandBox )
		{
			return oCatcherInTheRye;
		}, 'rye_toolkit' );
		TinyCore.start( 'catcher_in_the_rye' );

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
	it( 'the interface should contain a property : log', function ()
	{
		expect( TinyCore.ErrorHandler.log ).toBeFunction();
	} );
} );

/**
 * -------EXTENDED API TEST -------
 */

describe( 'TinyCore : extended API', function ()
{
	it( 'the TinyCore interface should contain these extended properties : startAll, stopAll, destroy, destroyAll, isStarted and registerAndStart', function ()
	{
		expect( TinyCore.startAll ).toBeFunction();
		expect( TinyCore.stopAll ).toBeFunction();
		expect( TinyCore.destroy ).toBeFunction();
		expect( TinyCore.isStarted ).toBeFunction();
		expect( TinyCore.registerAndStart ).toBeFunction();
	} );
} );

describe( 'TinyCore.isStarted', function ()
{
	it( 'should return false for an unknown module', function ()
	{
		expect( TinyCore.isStarted( '?' ) ) .toBeFalsy();
	} );

	it( 'should return false for an undefined module name', function ()
	{
		expect( TinyCore.isStarted() ) .toBeFalsy();
	} );

	it( 'should return false for a registered module that is not started', function ()
	{
		TinyCore.register( 'gyroscope', fpDummyCreator );

		expect( TinyCore.isStarted( 'gyroscope' ) ) .toBeFalsy();
	} );

	it( 'should return true for a registered module that is started', function ()
	{
		TinyCore.register( 'zero-g', fpDummyCreator );
		
		TinyCore.start( 'zero-g' );

		expect( TinyCore.isStarted( 'zero-g' ) ) .toBeTruthy();	
	} );
} );

describe( 'TinyCore.startAll', function ()
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

		TinyCore.register( 'airfilter1', function ( oSandBox )
		{
			return oAirFilter1;
		} );
		TinyCore.register( 'airfilter2', function ( oSandBox )
		{
			return oAirFilter2;
		} );
		TinyCore.register( 'airfilter3', function ( oSandBox )
		{
			return oAirFilter3;
		} );

		TinyCore.startAll();

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

		TinyCore.register( 'wheel1', function ( oSandBox )
		{
			return oWheel1;
		} );
		TinyCore.register( 'wheel2', function ( oSandBox )
		{
			return oWheel2;
		} );
		TinyCore.register( 'wheel3', function ( oSandBox )
		{
			return oWheel3;
		} );

		TinyCore.startAll( { 
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

		TinyCore.register( 'waterfilter1', function ( oSandBox )
		{
			return oWaterFilter1;
		} );
		TinyCore.register( 'waterfilter2', function ( oSandBox )
		{
			return oWaterFilter2;
		} );
		TinyCore.register( 'waterfilter3', function ( oSandBox )
		{
			return oWaterFilter3;
		} );

		TinyCore.startAll( ['waterfilter1', 'waterfilter2'] );

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

		TinyCore.register( 'charger1', function ( oSandBox )
		{
			return oCharger1;
		} );
		TinyCore.register( 'charger2', function ( oSandBox )
		{
			return oCharger2;
		} );
		TinyCore.register( 'charger3', function ( oSandBox )
		{
			return oCharger3;
		} );

		TinyCore.startAll( ['charger2', 'charger3'], { 
			'charger3'  : { nInc : 25 }
		} );

		expect( oCharger1.nBatteryLevel ).toEqual( 11 );
		expect( oCharger2.nBatteryLevel ).toEqual( 100 );
		expect( oCharger3.nBatteryLevel ).toEqual( 38 );
	} );
} );

describe( 'TinyCore.stopAll', function ()
{
	it( 'should stop all modules', function ()
	{
		var oModules = TinyCore.getModules();

		TinyCore.stopAll();

		for ( sModuleName in oModules )
		{
			expect( TinyCore.isStarted( sModuleName ) ).toBeFalsy();
		}
	} );

	it( 'should stop all selected modules properly', function ()
	{
		var oModules = TinyCore.getModules();

		TinyCore.register( 'gps1', fpDummyCreator );
		TinyCore.register( 'gps2', fpDummyCreator );
		TinyCore.register( 'gps3', fpDummyCreator );

		TinyCore.startAll( ['gps1', 'gps2', 'gps3'] );

		expect( TinyCore.isStarted( 'gps1' ) ).toBeTruthy();
		expect( TinyCore.isStarted( 'gps2' ) ).toBeTruthy();
		expect( TinyCore.isStarted( 'gps3' ) ).toBeTruthy();

		TinyCore.stopAll( ['gps1', 'gps3'] );

		expect( TinyCore.isStarted( 'gps1' ) ).toBeFalsy();
		expect( TinyCore.isStarted( 'gps2' ) ).toBeTruthy();
		expect( TinyCore.isStarted( 'gps3' ) ).toBeFalsy();
	} );

	it( 'stopAll then startAll should restart all stopped modules', function ()
	{
		var oModules = TinyCore.getModules();

		TinyCore.stopAll();

		// Prevent errors from previous tests.
		TinyCore.startAll( {
			'engines' : { nCount : 8 },
			'wheel1' : { nCoeff : 6 },
			'wheel3' : { nCoeff : 7},
			'charger1' : { nInc : 1 },
			'charger3' : { nInc : 0 }
		} );

		for ( sModuleName in oModules )
		{
			expect( TinyCore.isStarted( sModuleName ) ).toBeTruthy();
		}
	} );
} );

describe( 'TinyCore.destroy', function ()
{
	it( 'should throw an error when trying to destroy a module that is not registered', function ()
	{
		expect( function ()
		{
			TinyCore.destroy( 'swimmingpool' );
		} ).toThrow();
	} );

	it( 'should properly stop and destroy a single module', function ()
	{
		var oModules = TinyCore.getModules(),
			fpTemp1Spy = jasmine.createSpy();

		spyOn( TinyCore, 'stop' );

		TinyCore.register( 'temp1', function ( oSandBox )
		{
			return {
				onStart : function () {},
				onDestroy : fpTemp1Spy
			};
		} );
		expect( oModules['temp1'] ).toBeObject();

		TinyCore.start( 'temp1' );
		TinyCore.destroy( 'temp1' );

		expect( TinyCore.stop ).toHaveBeenCalledWith( 'temp1' );
		expect( fpTemp1Spy ).toHaveBeenCalled();
		expect( oModules['temp1'] ).toBeUndefined();
	} );
} );

describe( 'TinyCore.destroyAll', function ()
{
	beforeEach( function ()
	{
		spyOn( TinyCore, 'stop' );
	} );

	it( 'should properly stop and destroy all modules', function ()
	{
		var oModules = TinyCore.getModules();

		TinyCore.register( 'temp2', fpDummyCreator );
		TinyCore.register( 'temp3', fpDummyCreator );
		TinyCore.start( 'temp3' );
		TinyCore.register( 'temp4', fpDummyCreator );

		expect( oModules['temp2'] ).toBeObject();
		expect( oModules['temp3'] ).toBeObject();
		expect( TinyCore.isStarted( 'temp3' ) ).toBeTruthy();
		expect( oModules['temp4'] ).toBeObject();

		TinyCore.destroyAll();

		expect( TinyCore.stop ).toHaveBeenCalledWith( 'temp2' );
		expect( TinyCore.stop ).toHaveBeenCalledWith( 'temp3' );
		expect( TinyCore.stop ).toHaveBeenCalledWith( 'temp4' );

		expect( oModules ).toEqual( {} );
	} );

	it( 'should properly destroy a set of chosen modules', function ()
	{
		var oModules = TinyCore.getModules();

		TinyCore.register( 'temp5', fpDummyCreator );
		TinyCore.register( 'temp6', fpDummyCreator );
		TinyCore.register( 'temp7', fpDummyCreator );

		expect( oModules['temp5'] ).toBeObject();
		expect( oModules['temp6'] ).toBeObject();
		expect( oModules['temp7'] ).toBeObject();

		TinyCore.destroyAll( ['temp5', 'temp7'] );

		expect( TinyCore.stop ).toHaveBeenCalledWith( 'temp5' );
		expect( TinyCore.stop ).not.toHaveBeenCalledWith( 'temp6' );
		expect( TinyCore.stop ).toHaveBeenCalledWith( 'temp7' );

		expect( oModules['temp5'] ).toBeUndefined();
		expect( oModules['temp6'] ).toBeObject();
		expect( oModules['temp7'] ).toBeUndefined();
	} );
} );

describe( 'TinyCore.registerAndStart', function ()
{
	it( 'should register and start a module properly', function ()
	{
		var fpCreator = fpDummyCreator;

		spyOn( TinyCore, 'register' ).andReturn( true );
		spyOn( TinyCore, 'start' );

		TinyCore.registerAndStart( 'ism1', fpCreator );

		expect( TinyCore.register ).toHaveBeenCalledWith( 'ism1', fpCreator, undefined );
		expect( TinyCore.start ).toHaveBeenCalledWith( 'ism1', null );
	} );

	it( 'should not start a module if the registration failed', function ()
	{
		var fpCreator = fpDummyCreator;

		spyOn( TinyCore, 'register' ).andReturn( false );
		spyOn( TinyCore, 'start' );

		TinyCore.register( 'ism2', fpCreator );
		TinyCore.registerAndStart( 'ism2', fpCreator );

		expect( TinyCore.register ).toHaveBeenCalledWith( 'ism2', fpCreator );
		expect( TinyCore.start ).not.toHaveBeenCalled();
	} );
} );

/**
 * ------- AMD MODULES + REQUIRE TESTS -------
 */

describe( 'TinyCore.AMD', function ()
{
	it( 'the AMD interface should contain some properties : config, register and registerAndStart', function ()
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

		spyOn( TinyCore, 'register' );

		TinyCore.AMD.register( ['foo', 'bar'], fpCallback );

		expect( TinyCore.register.calls.length ).toEqual( 2 );

		expect( TinyCore.register.calls[0].args[0] ).toEqual( 'foo' );
		expect( TinyCore.register.calls[0].args[1] ).toEqual( window.require.AMDCreators[0] ); // See fake-require.js

		expect( TinyCore.register.calls[1].args[0] ).toEqual( 'bar' );
		expect( TinyCore.register.calls[1].args[1] ).toEqual( window.require.AMDCreators[1] );

		expect( fpCallback ).toHaveBeenCalled();
	} );
} );

describe( 'TinyCore.AMD.registerAndStart', function ()
{
	it( 'should properly register and start the modules using require and then execute the final callback', function ()
	{
		var oStartData2 = { b : 2, c : 3 },
			fpCallback = jasmine.createSpy();

		spyOn( TinyCore, 'register' );
		spyOn( TinyCore, 'start' );

		TinyCore.AMD.registerAndStart( ['baz', 'qux'], { 'qux' : oStartData2 }, fpCallback );

		expect( TinyCore.register.calls.length ).toEqual( 2 );

		expect( TinyCore.register.calls[0].args[0] ).toEqual( 'baz' );
		expect( TinyCore.register.calls[0].args[1] ).toEqual( window.require.AMDCreators[0] ); // See fake-require.js
		expect( TinyCore.start.calls[0].args[0] ).toEqual( 'baz' );
		expect( TinyCore.start.calls[0].args[1] ).toBeUndefined();

		expect( TinyCore.register.calls[1].args[0] ).toEqual( 'qux' );
		expect( TinyCore.register.calls[1].args[1] ).toEqual( window.require.AMDCreators[1] );
		expect( TinyCore.start.calls[1].args[0] ).toEqual( 'qux' );
		expect( TinyCore.start.calls[1].args[1] ).toEqual( oStartData2 );

		expect( fpCallback ).toHaveBeenCalled();
	} );
} );