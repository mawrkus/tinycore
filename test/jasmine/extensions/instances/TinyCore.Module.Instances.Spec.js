// Don't catch errors.
TinyCore.debugMode = true;

// Handy.
var oDummyModule = {
		onStart : function() {},
		onStop : function () {}
	},
	fpDummyCreator = function ()
	{
		return oDummyModule;
	};

/**
 * ------- MULTI-INSTANCES TESTS -------
 */

describe( 'TinyCore.Module', function ()
{
	it( 'should have the following methods : startInstance, stopInstance, start and stop', function ()
	{
		expect( TinyCore.Module.startInstance ).toBeFunction();
		expect( TinyCore.Module.stopInstance ).toBeFunction();
		expect( TinyCore.Module.start ).toBeFunction();
		expect( TinyCore.Module.stop ).toBeFunction();
	} );
} );

describe( 'TinyCore.Module.startInstance', function ()
{
	it( 'should throw an error when trying to start an instance of a module that is not registered', function ()
	{
		expect( function ()
		{
			TinyCore.Module.startInstance( '!', '?' );
		} ).toThrow();
	} );

	it( 'should instanciate a module', function ()
	{
		TinyCore.Module.define( 'e-tank', [], fpDummyCreator );

		spyOn( TinyCore.Module, 'instanciate' ).andReturn( oDummyModule );

		TinyCore.Module.startInstance( 'e-tank', 'desert-tank' );

		expect( TinyCore.Module.instanciate ).toHaveBeenCalledWith( 'e-tank' );
	} );

	it( 'should start several instances properly', function ()
	{
		var oInstanceDataA = null,
			oInstanceDataB = null,
			oInstanceDataC = null;

		TinyCore.Module.define( 'elevator', [], function ()
		{
			return {
				sName : '',
				nFloor : 0,
				nSpeed : 1,
				onStart : function ( oStartData )
				{
					this.sName = oStartData.name;
					this.nSpeed = oStartData.speed || this.nSpeed;
					this[oStartData.move]();
				},
				up : function ()
				{
					this.nFloor += this.nSpeed;
				},
				down : function ()
				{
					this.nFloor -= this.nSpeed;
				}
			};
		} );

		TinyCore.Module.startInstance( 'elevator', 'A', { name : 'A', move : 'up' } );
		TinyCore.Module.startInstance( 'elevator', 'B', { name : 'B', speed : 2, move : 'up' } );
		TinyCore.Module.startInstance( 'elevator', 'C', { name : 'C', speed : 4, move : 'down' } );

		oInstanceDataA = TinyCore.Module.getInstance( 'elevator', 'A' );
		oInstanceDataB = TinyCore.Module.getInstance( 'elevator', 'B' );
		oInstanceDataC = TinyCore.Module.getInstance( 'elevator', 'C' );

		expect( oInstanceDataA.oInstance.sName ).toEqual( 'A' );
		expect( oInstanceDataA.oInstance.nFloor ).toEqual( 1 );

		expect( oInstanceDataB.oInstance.sName ).toEqual( 'B' );
		expect( oInstanceDataB.oInstance.nFloor ).toEqual( 2 );

		expect( oInstanceDataC.oInstance.sName ).toEqual( 'C' );
		expect( oInstanceDataC.oInstance.nFloor ).toEqual( -4 );
	} );

	it( 'should not start an instance that has already been started', function ()
	{
		var oInstanceData = null;

		TinyCore.Module.define( 'e-seat',[], function ()
		{
			return {
				nVibPower : 10,
				onStart : function ()
				{
					this.nVibPower += 10;
				}
			};
		} );

		TinyCore.Module.startInstance( 'e-seat', 'front' );
		TinyCore.Module.startInstance( 'e-seat', 'back' );
		TinyCore.Module.startInstance( 'e-seat', 'back' );

		oInstanceData = TinyCore.Module.getInstance( 'e-seat', 'back' );
		expect( oInstanceData.oInstance.nVibPower ).toEqual( 20 );
	} );

	it( 'should be able to restart an instance that has been stopped', function ()
	{
		var oInstanceData = null;

		TinyCore.Module.define( 'firewall', [], function ()
		{
			return {
				nStatus : 0,
				onStart : function ( oStartData )
				{
					this.nStatus = oStartData.status;
				}
			};
		} );

		TinyCore.Module.startInstance( 'firewall', 'L1', { status : 2 } );
		oInstanceData = TinyCore.Module.getInstance( 'firewall', 'L1' );

		TinyCore.Module.stopInstance( 'firewall', 'L1' );
		expect( oInstanceData.oInstance.nStatus ).toEqual( 2 );

		TinyCore.Module.startInstance( 'firewall', 'L1', { status : 4 } );
		expect( oInstanceData.oInstance.nStatus ).toEqual( 4 );
	} );
} );

describe( 'TinyCore.Module.stopInstance', function ()
{
	it( 'should throw an error when trying to stop an instance of a module that is not registered', function ()
	{
		expect( function ()
		{
			TinyCore.Module.stopInstance( 'restroom' );
		} ).toThrow();
	} );

	it( 'should stop several instances properly', function ()
	{
		var oInstanceDataHall = null,
			oInstanceDataHQ = null;

		TinyCore.Module.define( 'radio', [], function ()
		{
			return {
				bOn : false,
				onStart : function ( oStartData )
				{
					this.bOn = true;
				},
				onStop : function ()
				{
					this.bOn = false;
				}
			};
		} );

		TinyCore.Module.startInstance( 'radio', 'hall' );
		TinyCore.Module.startInstance( 'radio', 'hq' );

		oInstanceDataHall = TinyCore.Module.getInstance( 'radio', 'hall' );
		oInstanceDataHQ = TinyCore.Module.getInstance( 'radio', 'hq' );

		expect( oInstanceDataHall.oInstance.bOn ).toEqual( true );
		expect( oInstanceDataHQ.oInstance.bOn ).toEqual( true );

		TinyCore.Module.stopInstance( 'radio', 'hall' );

		expect( oInstanceDataHall.oInstance.bOn ).toEqual( false );
		expect( oInstanceDataHQ.oInstance.bOn ).toEqual( true );

		TinyCore.Module.stopInstance( 'radio', 'hq' );

		expect( oInstanceDataHall.oInstance.bOn ).toEqual( false );
		expect( oInstanceDataHQ.oInstance.bOn ).toEqual( false );
	} );

	it( 'should not stop an instance that has already been stopped', function ()
	{
		var oInstanceData = null;

		TinyCore.Module.define( 'sensor', [], function ()
		{
			return {
				nThreshold : 18,
				onStart : function () {},
				onStop : function () {
					this.nThreshold -= 5;
				}
			};
		} );

		TinyCore.Module.startInstance( 'sensor', 'movements' );

		oInstanceData = TinyCore.Module.getInstance( 'sensor', 'movements' );

		TinyCore.Module.stopInstance( 'sensor', 'movements' );
		TinyCore.Module.stopInstance( 'sensor', 'movements' );

		expect( oInstanceData.oInstance.nThreshold ).toEqual( 13 );
	} );

	it( 'should allow the complete destruction of an instance', function ()
	{
		var oModule = {
			onStart : function () {},
			onStop : function () {},
			onDestroy : function () {}
		};

		TinyCore.Module.define( 'oblivion', [], function ()
		{
			return oModule;
		} );

		spyOn( oModule, 'onStop' );
		spyOn( oModule, 'onDestroy' );

		TinyCore.Module.startInstance( 'oblivion', 'ship#1' );
		TinyCore.Module.startInstance( 'oblivion', 'ship#2' );
		TinyCore.Module.stopInstance( 'oblivion', 'ship#1', true );

		expect( oModule.onStop ).toHaveBeenCalled();
		expect( oModule.onDestroy ).toHaveBeenCalled();
		expect( TinyCore.Module.getInstance( 'oblivion', 'ship#1' ) ).toBeUndefined();
		expect( TinyCore.Module.getInstance( 'oblivion', 'ship#2' ) ).toBeObject();
	} );
} );

describe( 'TinyCore.Module.start', function ()
{
	it( 'should start all instances properly', function ()
	{
		var oPriss = null,
			oLeon = null,
			oStartData = { age : 4 };

		TinyCore.Module.define( 'replicant', [], function ()
		{
			return {
				nAge : 1,
				onStart : function ( oStartData )
				{
					if ( oStartData && oStartData.age )
					{
						this.nAge = oStartData.age;
					}
				}
			};
		} );

		TinyCore.Module.startInstance( 'replicant', 'Priss' );
		TinyCore.Module.startInstance( 'replicant', 'Leon' );

		TinyCore.Module.stopInstance( 'replicant', 'Leon' );
		TinyCore.Module.stopInstance( 'replicant', 'Priss' );

		TinyCore.Module.start( 'replicant', oStartData );

		oPriss = TinyCore.Module.getInstance( 'replicant', 'Priss' );
		expect( oPriss.oInstance.nAge ).toEqual( 4 );

		oLeon = TinyCore.Module.getInstance( 'replicant', 'Leon' );
		expect( oLeon.oInstance.nAge ).toEqual( 4 );
	} );
} );

describe( 'TinyCore.Module.stop', function ()
{
	it( 'should stop all instances properly', function ()
	{
		var oRobert = null,
			oDrake = null;

		TinyCore.Module.define( 'drone', [], function ()
		{
			return {
				bSleepMode : true,
				onStart : function ( oStartData )
				{
					this.bSleepMode = true;
				},
				onStop : function ()
				{
					this.bSleepMode = false;
				}
			};
		} );

		TinyCore.Module.startInstance( 'drone', 'robert' );
		TinyCore.Module.startInstance( 'drone', 'drake' );

		oRobert = TinyCore.Module.getInstance( 'drone', 'robert' );
		oDrake = TinyCore.Module.getInstance( 'drone', 'drake' );

		expect( oRobert.oInstance.bSleepMode ).toEqual( true );
		expect( oDrake.oInstance.bSleepMode ).toEqual( true );

		TinyCore.Module.stop( 'drone' );

		expect( oRobert.oInstance.bSleepMode ).toEqual( false );
		expect( oDrake.oInstance.bSleepMode ).toEqual( false );
	} );

	it( 'should allow the complete destruction of all instances', function ()
	{
		var oModule = {
			onStart : function () {},
			onStop : function () {},
			onDestroy : function () {}
		};

		TinyCore.Module.define( 'well', [], function ()
		{
			return oModule;
		} );

		spyOn( oModule, 'onStop' );
		spyOn( oModule, 'onDestroy' );

		TinyCore.Module.startInstance( 'well', 'shallow' );
		TinyCore.Module.startInstance( 'well', 'deep' );
		TinyCore.Module.stop( 'well', true );

		expect( oModule.onStop ).toHaveBeenCalled();
		expect( oModule.onDestroy ).toHaveBeenCalled();
		expect( TinyCore.Module.getModules()['well'] ).toBeUndefined();
	} );
} );

describe( 'TinyCore.Module.getInstance', function ()
{
	TinyCore.Module.define( 'clone', [], function ()
	{
		return {
			sName : 'generic',
			onStart : function ( oStartData )
			{
				if ( oStartData && oStartData.name )
				{
					this.sName = oStartData.name;
				}
			}
		};
	} );

	it( 'should return undefined if no instance has been started', function ()
	{
		expect( TinyCore.Module.getInstance( 'clone', '6th' ) ).toBeUndefined();
	} );

	it( 'should return a proper object if a single instance has been started', function ()
	{
		var oInstanceData = null;

		TinyCore.Module.startInstance( 'clone', '6th' );

		oInstanceData = TinyCore.Module.getInstance( 'clone', '6th' );
		expect( oInstanceData ).toBeObject();
		expect( oInstanceData.oInstance ).toBeObject();
		expect( oInstanceData.oInstance.sName ).toEqual( 'generic' );
	} );

	it( 'should return the proper objects when many instances have been started', function ()
	{
		var oInstanceDataA = null,
			oInstanceDataB = null;

		TinyCore.Module.startInstance( 'clone', 'alpha' );
		TinyCore.Module.startInstance( 'clone', 'beta' );

		oInstanceDataA = TinyCore.Module.getInstance( 'clone', 'alpha' );
		expect( oInstanceDataA ).toBeObject();
		expect( oInstanceDataA.oInstance ).toBeObject();

		oInstanceDataB = TinyCore.Module.getInstance( 'clone', 'beta' );
		expect( oInstanceDataB ).toBeObject();
		expect( oInstanceDataB.oInstance ).toBeObject();

		expect( oInstanceDataA ).not.toBe( oInstanceDataB );
		expect( oInstanceDataA.oInstance ).not.toBe( oInstanceDataB.oInstance );
	} );
} );
