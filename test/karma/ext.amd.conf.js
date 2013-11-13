// Karma configuration
var shared = require( './shared.conf' );

module.exports = function( config )
{
	shared( config );

	config.files = [
		'build/TinyCore.js',
		'test/jasmine/extensions/AMD/RequireMock.js',
		'src/extensions/AMD/TinyCore.AMD.js',
		'test/jasmine/TinyCore.SpecHelper.js',
		'test/jasmine/extensions/AMD/TinyCore.AMD.Spec.js'
	];
};