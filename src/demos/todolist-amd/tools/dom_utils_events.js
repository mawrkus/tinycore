/**
 * DOM, utils and events tools.
 */
TinyCore.Toolbox.register( 'dom_utils_events', function ()
{
	'use strict';

	return {
		dom : {
			getById : function ( sID )
			{
				return document.getElementById( sID );
			},
			nodesToArray : function ( aNodes )
			{
				var aResults = [];

				try
				{
					aResults = Array.prototype.slice.call( aNodes ); // Non-IE and IE9+
				}
				catch ( erError )
				{
					var nIndex = 0,
						nLength = aNodes.length;

					for ( ; nIndex < nLength; nIndex++ )
					{
						aResults.push( aNodes[nIndex] );
					}
				}

				return aResults;
			},
			getByClass : ( function ()
			{
				if ( document.getElementsByClassName )
				{
					return function ( sClass )
					{
						return this.nodesToArray( document.getElementsByClassName( sClass ) );
					};
				}
				else if ( document.querySelectorAll )
				{
					return function ( sClass )
					{
						return this.nodesToArray( document.querySelectorAll( '.' + sClass ) );
					};
				}
				else
				{
					return function ( sClass )
					{
						var aElems = document.getElementsByTagName( '*' ),
							nIndex = aElems.length,
							oCurrentElem = null,
							aResults = [];

						while ( nIndex-- )
						{
							oCurrentElem = aElems[nIndex];
							if ( this.hasClass( oCurrentElem, sClass ) )
							{
								aResults.unshift( oCurrentElem );
							}
						}

						return aResults;
					};
				}
			} () ),
			addClass : function ( oElement, sClass )
			{
				if ( !this.hasClass( oElement, sClass) )
				{
					oElement.className += ' '+sClass;
				}
			},
			removeClass : function ( oElement, sClass )
			{
				if ( this.hasClass( oElement, sClass) )
				{
					oElement.className = oElement.className.replace( sClass, '' );
				}
			},
			toggleClass : function ( oElement, sClass, bAddOrRemove )
			{
				if ( typeof bAddOrRemove === 'undefined' )
				{
					bAddOrRemove = !this.hasClass( oElement, sClass );
				}
				this[bAddOrRemove?'addClass':'removeClass']( oElement, sClass );
			},
			hasClass : function ( oElement, sClass )
			{
				return oElement.className && oElement.className.indexOf( sClass ) !== -1;
			},
			toggle : function ( oElement, bShowOrHide )
			{
				if ( typeof bShowOrHide === 'undefined' )
				{
					bShowOrHide = this.hasClass( oElement, 'hidden' );
				}
				this.toggleClass( oElement, 'hidden', !bShowOrHide );
			},
			isVisible : function ( oElement )
			{
				return !this.hasClass( oElement, 'hidden' );
			},
			create : function ( sTagName )
			{
				return document.createElement( sTagName );
			},
			html : function ( oElement, sHTML )
			{
				if ( typeof sHTML !== 'undefined' )
				{
					oElement.innerHTML = sHTML;
				}
				else
				{
					return oElement.innerHTML;
				}
			},
			append : function ( oContainer, oChild )
			{
				oContainer.appendChild( oChild );
			},
			remove : function ( oElement )
			{
				oElement.parentNode.removeChild( oElement );
			},
			setData : function ( oElement, sDataName, sDataValue )
			{
				oElement.setAttribute( 'data-'+sDataName, sDataValue );
			},
			getData : function ( oElement, sDataName )
			{
				return oElement.getAttribute( 'data-'+sDataName );
			}
		},
		utils : {
			proxy : function ( fpFunc, oContext )
			{
				return function ()
				{
					fpFunc.apply( oContext, Array.prototype.slice.call( arguments ) );
				};
			},
			trim : function ( sString )
			{
				return sString.replace( /^\s+|\s+$/g, '' );
			}
		},
		events : ( function ( doc, win )
		{
			var fpAddEventHandler,
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
				bind : fpAddEventHandler,
				unbind : fpRemoveHandler,
				focus : function ( oElement )
				{
					oElement.focus();
				}
			};

		} ( document, window ) )
	};
} );
