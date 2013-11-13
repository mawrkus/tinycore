/**
 * Events tools.
 */
TinyCore.Toolbox.register( 'events', function ()
{
	'use strict';

	var doc = document,
		win = window,
		fpAddEventHandler,
		fpRemoveHandler,
		fpNormalizeEvents,
		fpIsHostMethod,
		fpCheckArguments;

	fpIsHostMethod = function ( oObject, sProperty )
	{
		var sType = typeof oObject[sProperty];

		return sType === "function" ||
				(sType === "object" && !! oObject[sProperty]) ||
				sType === "unknown";
	};

	fpNormalizeEvents = function ( eEvent )
	{
		eEvent.preventDefault = function ()
		{
			eEvent.returnValue = false;
		};
		eEvent.target = eEvent.srcElement;
		return eEvent;
	};

	fpCheckArguments = function ( oElement, sEvent, fpListener )
	{
		return ( ( ( oElement && oElement.tagName ) || oElement === doc ) && typeof sEvent === 'string' && typeof fpListener === 'function' );
	};

	if ( fpIsHostMethod( document, 'addEventListener' ) )
	{
		fpAddEventHandler = function ( oElement, sEvent, fpListener )
		{
			if ( fpCheckArguments( oElement, sEvent, fpListener ) )
			{
				oElement.addEventListener( sEvent, fpListener, false );
			}
		};

		fpRemoveHandler = function ( oElement, sEvent, fpListener )
		{
			if ( fpCheckArguments( oElement, sEvent, fpListener ) )
			{
				oElement.removeEventListener( sEvent, fpListener, false );
			}
		};
	}
	else if ( fpIsHostMethod( document, 'attachEvent' ) )
	{
		fpAddEventHandler = function ( oElement, sEvent, fpListener )
		{
			if ( fpCheckArguments( oElement, sEvent, fpListener ) )
			{
				oElement.attachEvent( 'on' + sEvent, function ()
				{
					var eEvent = fpNormalizeEvents( window.event );
					fpListener.call( oElement, eEvent );
					return eEvent.returnValue;
				});
			}
		};

		fpRemoveHandler = function ( oElement, sEvent, fpListener )
		{
			if ( fpCheckArguments( oElement, sEvent, fpListener ) )
			{
				oElement.detachEvent( 'on' + sEvent, fpListener );
			}
		};
	}
	else
	{
		fpAddEventHandler = function ( oElement, sEvent, fpListener )
		{
			if ( fpCheckArguments( oElement, sEvent, fpListener ) )
			{
				oElement['on' + sEvent] = function ()
				{
					var eEvent = fpNormalizeEvents( window.event );
					fpListener.call( oElement, eEvent );
					return eEvent.returnValue;
				};
			}
		};

		fpRemoveHandler = function ( oElement, sEvent, fpListener )
		{
			if ( fpCheckArguments( oElement, sEvent, fpListener ) )
			{
				oElement['on' + sEvent] = null;
			}
		};
	}

	return {
		on : fpAddEventHandler,
		off : fpRemoveHandler,
		focus : function ( oElement )
		{
			oElement.focus();
		}
	};
} );
