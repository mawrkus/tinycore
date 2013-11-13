// Karma configuration
var shared = require( './shared.conf' );

module.exports = function( config )
{
	shared( config );

	config.files = [
		'build/TinyCore.js',
		'src/extensions/Inheritance/TinyCore.Module.Inheritance.js',
		'src/extensions/Instances/TinyCore.Module.Instances.js',
		'test/jasmine/TinyCore.SpecHelper.js',
		'test/jasmine/extensions/Inheritance+Instances/TinyCore.Module.Inheritance+Instances.Spec.js'
	];
};
