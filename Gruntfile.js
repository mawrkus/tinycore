module.exports = function ( grunt )
{
	// Project configuration.
	grunt.initConfig(
	{
		pkg: grunt.file.readJSON( 'package.json' ),
		concat : {
			core:
			{
				src: [
						'src/Header.js',
						'src/TinyCore.Utils.js',
						'src/TinyCore.Toolbox.js',
						'src/TinyCore.Error.js',
						'src/TinyCore.Module.js',
						'src/Footer.js'
					],
				dest: 'build/TinyCore.js'
			},
			amd:
			{
				files:
				{
					'build/extensions/AMD/require-2.1.4.min.js' : ['src/extensions/AMD/require-2.1.4.min.js'],
					'build/extensions/AMD/TinyCore.AMD+domBoot.js' : [
						'src/extensions/AMD/TinyCore.AMD.js',
						'src/extensions/AMD/TinyCore.AMD.domBoot.js'
					]
				}
			}
		},
		jshint:
		{
			core:
			{
				options:
				{
					// W055: A constructor name should start with an uppercase letter.
					// Found in MDN's Function.prototype.bind shim.
					'-W055': true
				},
				src: [ 'build/TinyCore.js' ]
			},
			mediator:
			{
				src: ['src/tools/mediator/TinyCore.Toolbox.Mediator.js']
			},
			amd:
			{
				src: ['src/extensions/amd/TinyCore.AMD.js', 'build/extensions/amd/TinyCore.AMD.domBoot.js']
			},
			inheritance:
			{
				src: ['src/extensions/Inheritance/TinyCore.Module.Inheritance.js']
			},
			instances:
			{
				src: ['src/extensions/Instances/TinyCore.Module.Instances.js']
			},
			jasmine:
			{
				src: ['src/extensions/Jasmine/TinyCore.Toolbox.Jasmine.js']
			}
		},
		uglify:
		{
			options:
			{
				preserveComments: 'some',
				report: 'gzip'
			},
			core:
			{
				options : {
					footer: '/*! TinyCore v<%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd") %>) | (c) 2013 Marc Mignonsin | <%= pkg.license %> license */\n'
				},
				files:
				{
					'build/TinyCore.min.js' : ['build/TinyCore.js']
				}
			},
			mediator:
			{
				files:
				{
					'build/tools/mediator/TinyCore.Toolbox.Mediator.min.js' : ['src/tools/mediator/TinyCore.Toolbox.Mediator.js']
				}
			},
			amd:
			{
				files:
				{
					'build/extensions/AMD/TinyCore.AMD.min.js' : ['src/extensions/amd/TinyCore.AMD.js'],
					'build/extensions/AMD/TinyCore.AMD+domBoot.min.js' : ['build/extensions/amd/TinyCore.AMD+domBoot.js']
				}
			},
			inheritance:
			{
				files:
				{
					'build/extensions/Inheritance/TinyCore.Module.Inheritance.min.js' : ['src/extensions/Inheritance/TinyCore.Module.Inheritance.js']
				}
			},
			instances:
			{
				files:
				{
					'build/extensions/Instances/TinyCore.Module.Instances.min.js' : ['src/extensions/Instances/TinyCore.Module.Instances.js']
				}
			},
			jasmine:
			{
				files:
				{
					'build/extensions/Jasmine/TinyCore.Toolbox.Jasmine.min.js' : ['src/extensions/Jasmine/TinyCore.Toolbox.Jasmine.js']
				}
			}
		},
		clean : {
			amd : ['build/extensions/AMD/TinyCore.AMD+domBoot.js']
		},
		karma:
		{
			core: {
				configFile: 'test/karma/core.conf.js'
			},
			mediator: {
				configFile: 'test/karma/tools.mediator.conf.js'
			},
			amd: {
				configFile: 'test/karma/ext.amd.conf.js'
			},
			domBoot: {
				configFile: 'test/karma/ext.amd.domBoot.conf.js'
			},
			inheritance: {
				configFile: 'test/karma/ext.inheritance.conf.js'
			},
			instances: {
				configFile: 'test/karma/ext.instances.conf.js'
			},
			inherinstances: {
				configFile: 'test/karma/ext.inheritance+instances.conf.js'
			},
			jasmine: {
				configFile: 'test/karma/ext.jasmine.conf.js'
			}
		}
	} );

	grunt.loadNpmTasks( 'grunt-contrib-concat' );
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-contrib-clean' );
	grunt.loadNpmTasks( 'grunt-karma' );

	// Default task(s).
	grunt.registerTask( 'build-core', [ 'concat:core', 'jshint:core', 'uglify:core' ] );
	grunt.registerTask( 'build-mediator', [ 'jshint:mediator', 'uglify:mediator' ] );
	grunt.registerTask( 'build-amd', [ 'jshint:amd', 'concat:amd', 'uglify:amd', 'clean:amd' ] );
	grunt.registerTask( 'build-inheritance', [ 'jshint:inheritance', 'uglify:inheritance' ] );
	grunt.registerTask( 'build-instances', [ 'jshint:instances', 'uglify:instances' ] );
	grunt.registerTask( 'build-jasmine', [ 'jshint:jasmine', 'uglify:jasmine' ] );
	grunt.registerTask( 'build-all', [ 'build-core', 'build-mediator', 'build-amd', 'build-inheritance', 'build-instances', 'build-jasmine' ] );

	grunt.registerTask( 'karma-all', [ 'karma:core', 'karma:mediator', 'karma:amd', 'karma:domBoot', 'karma:inheritance', 'karma:instances', 'karma:inherinstances', 'karma:jasmine' ] );
	grunt.registerTask( 'build-all-plus-karma', [ 'karma-all', 'build-all' ] );

};
