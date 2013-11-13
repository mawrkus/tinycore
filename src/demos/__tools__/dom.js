/**
 * DOM tools.
 */
TinyCore.Toolbox.register( 'dom', function ()
{
	'use strict';

	var doc = document,
		win = window,
		CLASS_HIDDEN = 'hidden';

	return {
		getById : function ( sID )
		{
			return doc.getElementById( sID );
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
			if ( doc.getElementsByClassName )
			{
				return function ( sClass, oContext )
				{
					return this.nodesToArray( ( oContext || doc ).getElementsByClassName( sClass ) );
				};
			}
			else if ( doc.querySelectorAll )
			{
				return function ( sClass, oContext )
				{
					return this.nodesToArray( ( oContext || doc ).querySelectorAll( '.' + sClass ) );
				};
			}
			else
			{
				return function ( sClass, oContext )
				{
					var aElems = ( oContext || doc ).getElementsByTagName( '*' ),
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
				bShowOrHide = this.hasClass( oElement, CLASS_HIDDEN );
			}
			this.toggleClass( oElement, CLASS_HIDDEN, !bShowOrHide );
		},
		isVisible : function ( oElement )
		{
			return !this.hasClass( oElement, CLASS_HIDDEN );
		},
		create : function ( sTagName )
		{
			return doc.createElement( sTagName );
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
	};
} );