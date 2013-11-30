/**
 * Inheritance extension for TinyCore.js
 * @author mawrkus (web@sparring-partner.be)
 * @requires TinyCore.js
*/
;( function ( oEnv )
{
	'use strict';

	var TinyCore = oEnv.TinyCore,
		Utils = TinyCore.Utils,
		Module = TinyCore.Module;

	/**
	 * The inheritance extension.
	 * @type {Object}
	 */
	var _oInheritanceExt = {
		/**
		 * Defines a module that inherits from another.
		 * @param  {String} sSuperModuleName The name of the module to inherit from
		 * @param  {String} sModuleName The name of the module being defined
		 * @param  {Array} aToolsNames An array of tools names, that will be requested to the Toolbox and passed as arguments of fpCreator
		 * @param  {Function} fpCreator The function that creates and returns a module instance
		 * @return {Boolean} Whether the module was successfuly or not
		 */
		inherit : function ( sSuperModuleName, sModuleName, aToolsNames, fpCreator )
		{
			var oModulesData = Module.getModules();

			if ( sSuperModuleName === sModuleName ||
					!oModulesData[sSuperModuleName] || oModulesData[sModuleName] ||
					!Utils.isFunction( fpCreator ) )
			{
				return false;
			}

			oModulesData[sModuleName] = {
				fpCreator	: fpCreator,
				oInstances	: {},
				aToolsNames : aToolsNames,
				sSuper : sSuperModuleName
			};

			return true;
		},
		/**
		 * Instantiates a module, taking into account that it might be inherited from another.
		 * Uses prototypal inheritance.
		 * @param {String} sModuleName The module name
		 * @return {Object} The module instance
		 * @throws {Error} If the module has not been defined
		 */
		instantiate : ( function ( fpOriginalInstantiate )
		{
			return function ( sModuleName )
			{
				var oModulesData = Module.getModules(),
					oModuleData = oModulesData[sModuleName],
					aSuperChain = [],
					sCurrentName = sModuleName,
					nChainIndex,
					oInstance = {},
					oSuperInstance;

				if ( !oModuleData )
				{
					TinyCore.Error.report( 'The module "'+sModuleName+'" is not defined!' );
				}

				do
				{
					aSuperChain.push( { name : sCurrentName, creator : oModuleData.fpCreator } );
					sCurrentName = oModuleData.sSuper;
					oModuleData = oModulesData[sCurrentName];
				}
				while ( oModuleData );

				nChainIndex = aSuperChain.length - 1;

				do
				{
					aSuperChain[nChainIndex].creator.prototype = oInstance;
					oInstance = fpOriginalInstantiate.call( Module, aSuperChain[nChainIndex].name );
				}
				while ( nChainIndex-- );

				return oInstance;
			};
		} ( Module.instantiate ) )
	};

	/**
	 * The createModuleObject utilities extension.
	 * @type {Object}
	 */
	var _oUtilsExt = {
		/**
		 * Creates a new module object and sets properly its prototype.
		 * @param  {Function} fpCreator
		 * @param  {Array} aArgs
		 * @return {Object}
		 */
		createModuleObject : function ( fpCreator, aArgs )
		{
			var oModule = fpCreator.apply( null, aArgs ),
				F = function () {},
				oPrototype = fpCreator.prototype;

			Utils.forIn( oModule, function ( prop, sPropName )
			{
				var protoProp = oPrototype[sPropName];

				if ( Utils.isObject( protoProp ) )
				{
					// Allow a child property to enrich/replace a parent property.
					oPrototype[sPropName] = Utils.isObject( oModule[sPropName] ) ?
						Utils.extend( oPrototype[sPropName], oModule[sPropName] ) :
						oModule[sPropName];
				}
				else if ( Utils.isFunction( protoProp ) )
				{
					// Give access to the parent method.
					oPrototype[sPropName] = function ()
					{
						var tmp = this._super,
							result;

						this._super = protoProp;
						result = oModule[sPropName].apply( this, arguments );
						this._super = tmp;

						return result;
					};
				}
				else
				{
					oPrototype[sPropName] = oModule[sPropName];
				}
			} );

			F.prototype = oPrototype;

			return new F();
		}
	};

	// Redefine TinyCore.
	Utils.extend( Utils, _oUtilsExt );
	Utils.extend( Module, _oInheritanceExt );

} ( this ) );
