// Don't catch errors.
TinyCore.debugMode = true;

// Dummy tools.
TinyCore.Toolbox.register( 'dummydep1', function ()
{
	return { name : 'dependency #1' };
} );
TinyCore.Toolbox.register( 'dummydep2', function ()
{
	return { name : 'dependency #2' };
} );
TinyCore.Toolbox.register( 'dummydep3', function ()
{
	return { name : 'dependency #3' };
} );

// Grand father "operator"...
TinyCore.Module.define( 'operator', ['dummydep1'], function ( dummydep1 )
{
	return {
		name : 'op',
		op : function ( a, b ) { return 'error: missing operator on ('+a+','+b+')!'; },
		op1 : null,
		op2 : null,
		result : null,
		history : {
			enabled : false,
			config : {
				verbose : true
			}
		},
		onStart : function ( oStartData )
		{
			this.op1 = oStartData.op1;
			this.op2 = oStartData.op2;
			this.compute();
		},
		compute : function ()
		{
			this.result = this.op.call( this, this.op1, this.op2 );
		}
	};
} );

// Father "addition"...
TinyCore.Module.inherit( 'operator', 'addition', ['dummydep2', 'dummydep3'], function ( dummydep2, dummydep3 )
{
	return {
		name : 'sum',
		op : function ( a, b ) { return a+b; },
		op1 : 0,
		op2 : 0,
		onStart : function ( oStartData )
		{
			this._super( oStartData );
		},
		history : {
			enabled : true,
			config : {
				verbose : false,
				log : 'all'
			},
			stack : []
		}
	};
} );

// Child "inc"...
TinyCore.Module.inherit( 'addition', 'inc', [], function ()
{
	return {
		name : 'inc',
		op : function ( a ) { return this._super( a, this.incValue ); },
		onStart : function ( oStartData )
		{
			this._super( oStartData );
		},
		incValue : 1,
		history : {
			config : null
		}
	};
} );

// Child "dec"...
TinyCore.Module.inherit( 'addition', 'dec', [], function ()
{
	return {
		name : 'dec',
		op : function ( a ) { return this._super( a, -this.decValue ); },
		onStart : function ( oStartData )
		{
			this._super( oStartData );
			this.changeInc( oStartData.dec );
		},
		changeInc : function ( nNewDec )
		{
			this.decValue = nNewDec;
			this.compute();
		},
		decValue : 1,
		history : null
	};
} );

/**
 * ------- INHERITANCE TESTS -------
 */

describe( 'TinyCore.Module', function ()
{
	it( 'should have the following methods : inherit and instantiate', function ()
	{
		expect( TinyCore.Module.inherit ).toBeFunction();
		expect( TinyCore.Module.instantiate ).toBeFunction();
	} );
} );

describe( 'TinyCore.Module.inherit', function ()
{
	var oDummyModule = {
			onStart : function() {},
			onStop : function () {}
		},
		fpDummyCreator = function ()
		{
			return oDummyModule;
		};

	TinyCore.Module.define( 'statement', [], fpDummyCreator );

	it( 'should return true when defining a module that was not previously defined', function ()
	{
		expect( TinyCore.Module.inherit( 'statement', 'while', [], fpDummyCreator ) ).toBe( true );
	} );
	it( 'should return false when trying to define a module that was previously defined', function ()
	{
		expect( TinyCore.Module.inherit( 'statement', 'while', [], fpDummyCreator ) ).toBe( false );
	} );
	it( 'should return false when trying to define a module without passing a creator function', function ()
	{
		expect( TinyCore.Module.inherit( 'statement', 'if', [] ) ).toBe( false );
	} );
	it( 'should return false when specifying the same name for the super module', function ()
	{
		expect( TinyCore.Module.inherit( 'statement', 'statement', [], fpDummyCreator ) ).toBe( false );
	} );
	it( 'should return false when trying to inherit from a module that was not previously defined', function ()
	{
		expect( TinyCore.Module.inherit( 'expression', 'function', [], fpDummyCreator ) ).toBe( false );
	} );
} );

describe( 'TinyCore.Module.instantiate', function ()
{
	it( 'should instantiate a child module that share the same properties as its super module', function ()
	{
		var oInstance = TinyCore.Module.instantiate( 'addition' ),
			oExpectedHistory = {
				enabled : true,
				config : {
					verbose : false,
					log : 'all'
				},
				stack : []
			};

		expect( oInstance.name ).toBe( 'sum' );
		expect( oInstance.op ).toBeFunction();
		expect( oInstance.op1 ).toBe( 0 );
		expect( oInstance.op2 ).toBe( 0 );
		expect( oInstance.result ).toBeNull();
		expect( oInstance.onStart ).toBeFunction();
		expect( oInstance.compute ).toBeFunction();
		expect( oInstance.history ).toEqual( oExpectedHistory );

		expect( oInstance.__tools__.dummydep2 ).toBeObject();
		expect( oInstance.__tools__.dummydep3 ).toBeObject();
		expect( oInstance.__tools__.dummydep1 ).toBeObject();
	} );

	it( 'should instantiate a grandchild module that share the same properties as its super modules', function ()
	{
		var oInstance = TinyCore.Module.instantiate( 'inc' ),
			oExpectedHistory = {
				enabled : true,
				config : null,
				stack : []
			};;

		expect( oInstance.name ).toBe( 'inc' );
		expect( oInstance.op ).toBeFunction();
		expect( oInstance.op1 ).toBe( 0 );
		expect( oInstance.op2 ).toBe( 0 );
		expect( oInstance.result ).toBeNull();
		expect( oInstance.onStart ).toBeFunction();
		expect( oInstance.compute ).toBeFunction();
		expect( oInstance.incValue ).toBe( 1 );
		expect( oInstance.history ).toEqual( oExpectedHistory );

		expect( oInstance.__tools__.dummydep2 ).toBeObject();
		expect( oInstance.__tools__.dummydep3 ).toBeObject();
		expect( oInstance.__tools__.dummydep1 ).toBeObject();
	} );

	it( 'should instantiate another grandchild module that share the same properties as its super modules', function ()
	{
		var oInstance = TinyCore.Module.instantiate( 'dec' );

		expect( oInstance.name ).toBe( 'dec' );
		expect( oInstance.op ).toBeFunction();
		expect( oInstance.op1 ).toBe( 0 );
		expect( oInstance.op2 ).toBe( 0 );
		expect( oInstance.result ).toBeNull();
		expect( oInstance.onStart ).toBeFunction();
		expect( oInstance.compute ).toBeFunction();
		expect( oInstance.decValue ).toBe( 1 );
		expect( oInstance.history ).toBeNull();

		expect( oInstance.__tools__.dummydep2 ).toBeObject();
		expect( oInstance.__tools__.dummydep3 ).toBeObject();
		expect( oInstance.__tools__.dummydep1 ).toBeObject();
	} );
} );

describe( 'TinyCore.Module.start', function ()
{
	it( 'should start a father module properly', function ()
	{
		TinyCore.Module.start( 'operator', { op1 : 7, op2 : 4 } );

		expect( TinyCore.Module.getInstance( 'operator' ).oInstance.result ).toBe( 'error: missing operator on (7,4)!' );
	} );

	it( 'should start a child module properly', function ()
	{
		TinyCore.Module.start( 'addition', { op1 : 17, op2 : 34 } );

		expect( TinyCore.Module.getInstance( 'addition' ).oInstance.result ).toBe( 51 );
	} );

	it( 'should start a grand child module properly', function ()
	{
		var oIncInstance;

		TinyCore.Module.start( 'inc', { op1 : 41 } );

		oIncInstance = TinyCore.Module.getInstance( 'inc' ).oInstance;

		expect( oIncInstance.result ).toBe( 42 );
	} );

	it( 'should allow the module to use overriden and inherited methods properly', function ()
	{
		var oDecInstance;

		TinyCore.Module.start( 'dec', { op1 : 66, dec : 24 } );

		oInstance = TinyCore.Module.getInstance( 'dec' ).oInstance;

		expect( oInstance.result ).toBe( 42 );
	} );
} );

describe( 'TinyCore.Module.stop', function ()
{
	var sDestructionTrace = '';

	TinyCore.Module.define( 'person', [], function ()
	{
		return {
			name : '',
			isLiving : null,
			onStart : function ( oStartData )
			{
				this.name = oStartData.name;
				this.isLiving = true;
			},
			onStop : function ()
			{
			},
			onDestroy : function ()
			{
				sDestructionTrace += '>person';
			}
		};
	} );

	TinyCore.Module.inherit( 'person', 'warrior', [], function ()
	{
		return {
			isFighting : null,
			onStart : function ( oStartData )
			{
				this._super( oStartData );
				this.isFighting = true;
			},
			onStop : function ()
			{
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

	TinyCore.Module.inherit( 'warrior', 'samurai', [], function ()
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

	it( 'should stop an inherited module and his ancestors properly', function ()
	{
		var oSamuraiInstance;

		TinyCore.Module.start( 'samurai', { name : 'Oda Nobunaga' } );

		oSamuraiInstance = TinyCore.Module.getInstance( 'samurai' ).oInstance;

		expect( oSamuraiInstance.name ).toBe( 'Oda Nobunaga' );
		expect( oSamuraiInstance.isLiving ).toBe( true );
		expect( oSamuraiInstance.isFighting ).toBe( true );
		expect( oSamuraiInstance.followsBushido ).toBe( true );

		TinyCore.Module.stop( 'samurai' );

		expect( oSamuraiInstance.isLiving ).toBe( true );
		expect( oSamuraiInstance.isFighting ).toBe( false );
		expect( oSamuraiInstance.followsBushido ).toBe( false );
	} );

	it( 'should stop and destroy an inherited module and his ancestors properly', function ()
	{
		var oSamuraiInstance;

		TinyCore.Module.start( 'samurai', { name : 'Toyotomi Hideyoshi' } );

		oSamuraiInstance = TinyCore.Module.getInstance( 'samurai' ).oInstance;

		expect( oSamuraiInstance.name ).toBe( 'Toyotomi Hideyoshi' );
		expect( oSamuraiInstance.isLiving ).toBe( true );
		expect( oSamuraiInstance.isFighting ).toBe( true );
		expect( oSamuraiInstance.followsBushido ).toBe( true );

		TinyCore.Module.stop( 'samurai', true );

		expect( sDestructionTrace ).toBe( 'samurai>warrior>person' );
	} );
} );
