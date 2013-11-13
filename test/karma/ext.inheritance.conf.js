// Karma configuration
var shared = require( './shared.conf' );

module.exports = function( config )
{
	shared( config );

	config.files = [
		'build/TinyCore.js',
		'src/extensions/Inheritance/TinyCore.Module.Inheritance.js',
		'test/jasmine/TinyCore.SpecHelper.js',
		'test/jasmine/extensions/Inheritance/TinyCore.Module.Inheritance.Spec.js'
	];
};