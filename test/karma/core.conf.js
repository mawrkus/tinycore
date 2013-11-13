// Karma configuration
var shared = require( './shared.conf' );

module.exports = function( config )
{
	shared( config );

	config.files = [
		'build/TinyCore.js',
		'test/jasmine/TinyCore.SpecHelper.js',
		'test/jasmine/TinyCore.Spec.js'
	];
};
