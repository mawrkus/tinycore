// Don't catch errors.
TinyCore.debugMode = true;

/**
 * ------- TOOLBOX > MEDIATOR TESTS -------
 */

describe( 'TinyCore.Toolbox.request(\'mediator\')', function ()
{
	var oMediator = TinyCore.Toolbox.request( 'mediator' );

	it( 'should create an object having the following methods/properties : subscribe, publish, unsubscribe, unsubscribeAll', function ()
	{
		expect( oMediator ).toBeObject();
		expect( oMediator.subscribe ).toBeFunction();
		expect( oMediator.publish ).toBeFunction();
		expect( oMediator.unsubscribe ).toBeFunction();
		expect( oMediator.unsubscribeAll ).toBeFunction();
	} );

	it( 'should create unique mediator objects', function ()
	{
		expect( oMediator ).not.toEqual( TinyCore.Toolbox.request( 'mediator' ) );
	} );

	describe( 'A new mediator, using subscribe, publish, unsubscribe and unsubscribeAll', function ()
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

			oMediator.subscribe( 'channel:object:action', fpHandler );
			oMediator.publish( 'channel:object:action', oData );

			jasmine.Clock.tick( 10 ); // Should be enough.

			expect( fpHandler ).toHaveBeenCalledWith( { name : 'channel:object:action', data : oData } );
		} );

		it( 'should be able to subscribe to topics, in a chosen context', function ()
		{
			var oContext = {
				program : '6',
				started : false
			},
			oData = {
				playlist : ['stepkids', 'bonobo']
			},
			fpRadioHandler = function ( oTopic )
			{
				this.started = true;
				this.current = oTopic.data.playlist[0];
			};

			oMediator.subscribe( 'bbc:radio:on', fpRadioHandler, oContext );
			oMediator.publish( 'bbc:radio:on', oData );

			jasmine.Clock.tick( 10 ); // Should be enough.

			expect( oContext.started ).toBe( true );
			expect( oContext.current ).toBe( 'stepkids' );
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

			oMediator.subscribe( ['start-com', 'start-engine'], fpHandler );
			oMediator.subscribe( 'start-heat', fpHandler );
			oMediator.publish( 'start-com', oData1 );
			oMediator.publish( 'start-heat', oData2 );

			jasmine.Clock.tick( 10 ); // Should be enough.

			expect( fpHandler.calls.length ).toEqual( 2 );
			expect( fpHandler.calls[0].args[0] ).toEqual( { name : 'start-com', data : oData1 } );
			expect( fpHandler.calls[1].args[0] ).toEqual( { name : 'start-heat', data : oData2 } );
		} );

		it( 'should not be able to subscribe twice to a topic', function ()
		{
			oMediator.subscribe( 'reset-lab', fpHandler );
			oMediator.subscribe( 'reset-lab', fpHandler );
			oMediator.publish( 'reset-lab' );

			jasmine.Clock.tick( 10 ); // Should be enough.

			expect( fpHandler.calls.length ).toEqual( 1 );
		} );

		it( 'should be able to publish a topic that will be received by another mediator', function ()
		{
			var oData = {
					bAllSystemsActive : false,
					nFuelLeft : 13
				},
				oOtherMediator = TinyCore.Toolbox.request( 'mediator' );

			oOtherMediator.subscribe( ['stop-com', 'stop-engine', 'stop-heat'], fpHandler );

			oMediator.publish( 'stop-engine', oData );
			oMediator.publish( 'stop-heat' );

			jasmine.Clock.tick( 10 ); // Should be enough.

			expect( fpHandler.calls.length ).toEqual( 2 );
			expect( fpHandler.calls[0].args[0] ).toEqual( { name : 'stop-engine', data : oData } );
			expect( fpHandler.calls[1].args[0] ).toEqual( { name : 'stop-heat', data : undefined } );
		} );

		it( 'should garantee that the data associated with the topic published is a copy, so that other mediators do not have surprises', function ()
		{
			var oData = {
					bAtHome : true
				},
				oOtherMediator1 = TinyCore.Toolbox.request( 'mediator' ),
				fpHandler1 = function ( oTopic )
				{
					oTopic.data.bAtHome = false;
				},
				oOtherMediator2 = TinyCore.Toolbox.request( 'mediator' ),
				fpHandler2 = function ( oTopic )
				{
					if ( oTopic.data.bAtHome )
					{
						// ?
					}
				};

			oOtherMediator1.subscribe( 'visit', fpHandler1 );
			oOtherMediator2.subscribe( 'visit', fpHandler2 );

			// By default, without specifying the last parameter to true, the data will be copied.
			oMediator.publish( 'visit', oData );

			jasmine.Clock.tick( 10 ); // Should be enough.

			expect( oData.bAtHome ).toBe( true );
		} );

		it( 'should allow that the data associated with the topic published is not a copy, so that other mediators can share surprises', function ()
		{
			var oData = {
					bAway : true
				},
				oOtherMediator1 = TinyCore.Toolbox.request( 'mediator' ),
				fpHandler1 = function ( oTopic )
				{
					oTopic.data.bAway = false;
				},
				oOtherMediator2 = TinyCore.Toolbox.request( 'mediator' ),
				fpHandler2 = function ( oTopic )
				{
					if ( oTopic.data.bAway )
					{
						// ?
					}
				};

			oOtherMediator1.subscribe( 'surprise', fpHandler1 );
			oOtherMediator2.subscribe( 'surprise', fpHandler2 );

			// The last parameter tells not to copy the data.
			oMediator.publish( 'surprise', oData, true );

			jasmine.Clock.tick( 10 ); // Should be enough.

			expect( oData.bAway ).toBe( false );
		} );

		it( 'should be able to subscribe to a topic and to choose the handler context', function ()
		{
			var oFuelSystem = { nFuelLeft : 88 },
				fpDecFuel = function ( oTopic )
				{
					this.nFuelLeft -= oTopic.data.nDecFuel;
				};

			oMediator.subscribe( 'fuel-down', fpDecFuel, oFuelSystem );
			oMediator.publish( 'fuel-down', { nDecFuel : 3 } );

			jasmine.Clock.tick( 10 ); // Should be enough.

			expect( oFuelSystem.nFuelLeft ).toEqual( 85 );
		} );

		it( 'should unsubscribe properly from subscribed topics', function ()
		{
			var oMediator = TinyCore.Toolbox.request( 'mediator' ),
				fpHandler = jasmine.createSpy();

			jasmine.Clock.useMock();

			oMediator.subscribe( ['activate-lab', 'enter-green-mode', 'deploy-solar-wings', 'ride-on'], fpHandler );
			oMediator.unsubscribe( ['activate-lab', 'enter-green-mode'] );
			oMediator.unsubscribe( 'ride-on' );

			oMediator.publish( 'activate-lab' );
			oMediator.publish( 'enter-green-mode' );
			oMediator.publish( 'deploy-solar-wings' );
			oMediator.publish( 'ride-on' );

			jasmine.Clock.tick( 10 ); // Should be enough.

			expect( fpHandler.calls.length ).toEqual( 1 );
		} );

		it( 'should unsubscribe properly from all subscribed topics', function ()
		{
			var oMediator = TinyCore.Toolbox.request( 'mediator' ),
				fpHandler = jasmine.createSpy();

			jasmine.Clock.useMock();

			oMediator.subscribe( ['activate-lab', 'enter-green-mode', 'deploy-solar-wings', 'ride-on'], fpHandler );
			oMediator.unsubscribeAll();

			oMediator.publish( 'activate-lab' );
			oMediator.publish( 'enter-green-mode' );
			oMediator.publish( 'deploy-solar-wings' );
			oMediator.publish( 'ride-on' );

			jasmine.Clock.tick( 10 ); // Should be enough.

			expect( fpHandler.calls.length ).toEqual( 0 );
		} );
	} );
} );
