// Karma configuration
var shared = require( './shared.conf' );

module.exports = function( config )
{
	shared( config );

	config.files = [
		'build/TinyCore.js',
		'src/extensions/Jasmine/TinyCore.Toolbox.Jasmine.js',
		'test/jasmine/TinyCore.SpecHelper.js',
		'test/jasmine/extensions/Jasmine/TinyCore.Toolbox.Jasmine.Spec.js'
	];
};