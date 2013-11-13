// Karma configuration
var shared = require( './shared.conf' );

module.exports = function( config )
{
	shared( config );

	config.files = [
		'build/TinyCore.js',
		'src/tools/mediator/TinyCore.Toolbox.Mediator.js',
		'test/jasmine/TinyCore.SpecHelper.js',
		'test/jasmine/tools/mediator/TinyCore.Toolbox.Mediator.Spec.js'
	];
};