// Don't catch errors.
TinyCore.debugMode = true;

// Tools.
TinyCore.Toolbox.register( 'armour', function ()
{
	return {
		name : 'armour',
		damaged : true,
		repair : function ()
		{
			this.damaged = false;
		}
	};
} );
TinyCore.Toolbox.register( 'sword', function ()
{
	return {
		name : 'sword',
		isClean : false,
		clean : function ()
		{
			this.isClean = true;
		}
	};
} );

var sDestructionTrace;

TinyCore.Module.define( 'person', [], function ()
{
	return {
		rank : '',
		isLiving : null,
		onStart : function ( oStartData )
		{
			this.rank = oStartData.rank;
			this.isLiving = true;
		},
		onStop : function ()
		{
		},
		onDestroy : function ()
		{
			this.isLiving = false;
			sDestructionTrace += '>person';
		}
	};
} );

TinyCore.Module.inherit( 'person', 'warrior', ['armour'], function ( armour )
{
	return {
		isFighting : null,
		isArmourDamaged : null,
		onStart : function ( oStartData )
		{
			this._super( oStartData );

			this.isFighting = true;

			if ( this.rank === '#2' )
			{
				armour.repair();
			}
		},
		onStop : function ()
		{
			this.isArmourDamaged = armour.damaged;
			this.isFighting = false;
			this._super();
		},
		onDestroy : function ()
		{
			sDestructionTrace += '>warrior';
			this._super();
		}
	};
} );

TinyCore.Module.inherit( 'warrior', 'samurai', ['sword'], function ( sword )
{
	return {
		followsBushido : null,
		onStart : function ( oStartData )
		{
			this._super( oStartData );
			this.followsBushido = true;
		},
		onStop : function ()
		{
			this.followsBushido = false;
			this._super();
		},
		onDestroy : function ()
		{
			sDestructionTrace += 'samurai';
			this._super();
		}
	};
} );

describe( 'TinyCore.Module.StartInstance', function ()
{

	it( 'should start/stop/destroy several inherited instances properly', function ()
	{
		var oSamuraiInstance1,
			oSamuraiInstance2;

		TinyCore.Module.startInstance( 'samurai', 'Oda Nobunaga', { rank : '#1' } );
		TinyCore.Module.startInstance( 'samurai', 'Toyotomi Hideyoshi', { rank : '#2' } );

		oSamuraiInstance1 = TinyCore.Module.getInstance( 'samurai', 'Oda Nobunaga' ).oInstance;
		oSamuraiInstance2 = TinyCore.Module.getInstance( 'samurai', 'Toyotomi Hideyoshi' ).oInstance;

		expect( oSamuraiInstance1.rank ).toBe( '#1' );
		expect( oSamuraiInstance1.isLiving ).toBe( true );
		expect( oSamuraiInstance1.isFighting ).toBe( true );
		expect( oSamuraiInstance1.followsBushido ).toBe( true );

		expect( oSamuraiInstance2.rank ).toBe( '#2' );
		expect( oSamuraiInstance2.isLiving ).toBe( true );
		expect( oSamuraiInstance2.isFighting ).toBe( true );
		expect( oSamuraiInstance2.followsBushido ).toBe( true );

		sDestructionTrace = '';

		TinyCore.Module.stopInstance( 'samurai', 'Oda Nobunaga', true );

		expect( oSamuraiInstance1.isLiving ).toBe( false );
		expect( oSamuraiInstance1.isArmourDamaged ).toBe( true );
		expect( oSamuraiInstance1.isFighting ).toBe( false );
		expect( oSamuraiInstance1.followsBushido ).toBe( false );
		expect( sDestructionTrace ).toBe( 'samurai>warrior>person' );

		TinyCore.Module.stopInstance( 'samurai', 'Toyotomi Hideyoshi' );

		expect( oSamuraiInstance2.rank ).toBe( '#2' );
		expect( oSamuraiInstance2.isLiving ).toBe( true );
		expect( oSamuraiInstance2.isArmourDamaged ).toBe( false );
		expect( oSamuraiInstance2.isFighting ).toBe( false );
		expect( oSamuraiInstance2.followsBushido ).toBe( false );
	} );
} );
