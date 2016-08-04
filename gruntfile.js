/*jslint node: true */
'use strict';

module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-html2js');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-bower-task');
	grunt.loadNpmTasks('grunt-ng-constant');

	// Project configuration
	grunt.initConfig({
		bower: {
			install: {
				options: {
					install: true,
					copy: false,
					targetDir: 'dist',
					cleanTargetDir: true
				}
			}
		},
		// Concats all js files into one
		concat: {
			options: {
				seperator: ';'
			},
			dist: {
				src: [
					// App
					'client/src/app/*.js',
					// Templates
					'client/tmp/*.js',
					// Modules
					'client/src/app/**/*.js',
					// Components
					'client/src/components/**/*.js'
				],
				dest: 'client/dist/app.js'
			}
		},
		// Fresh build folder
		clean: {
			temp: {
				src: ['client/tmp']
			}
		},
		// // Starts FE server
		// connect: {
		// 	server: {
		// 		options: {
		// 			hostname: 'localhost',
		// 			port: 9001,
		// 			base: ['client/dist']
		// 		}
		// 	}
		// },
		copy: {
			main: {
				src: 'client/src/app/index.html',
				dest: 'client/dist/index.html',
			},
			assets: {
				expand: true,
				flatten: true,
				filter: 'isFile',
				src: ['client/src/assets/images/*.{png, jpg, gif}'],
				dest: 'client/dist/assets/images'
			},
			images: {
				expand: true,
				flatten: true,
				src: ['client/src/assets/images/backgrounds/thumbnails/*.jpg'],
				dest: 'client/dist/assets/images/backgrounds/thumbnails'
			},
			images2: {
				expand: true,
				flatten: true,
				src: ['client/src/assets/images/backgrounds/full/*.jpg'],
				dest: 'client/dist/assets/images/backgrounds/full'
			},
			fonts: {
				expand: true,
				flatten: true,
				filter: 'isFile',
				src: ['client/src/assets/fonts/**/*.otf'],
				dest: 'client/dist/assets/fonts/Helvetica_Neue'
			},
			mocks: {
				expand: true,
				flatten: true,
				filter: 'isFile',
				src: ['client/src/assets/mocks/*.js'],
				dest: 'client/dist/assets/mocks'

			},
			scripts: {
				expand: true,
				flatten: true,
				filter: 'isFile',
				src: ['client/src/assets/scripts/*.js'],
				dest: 'client/dist/assets/scripts'
			}
		},
		// Converts templates to js
		html2js: {
			app: {
				options: {
					base: 'client/src/app'
				},
 				src: [
 					// Module templates
				'client/src/app/**/*.tpl.html',
				],
				dest: 'client/tmp/app-templates.js'
			},
			components: {
				options: {
					base: 'client/src/components'
				},
				src: [
 					// Component templates
 					'client/src/components/**/*.tpl.html'
 				],
				dest: 'client/tmp/component-templates.js'
			}
		},
		// Runs jshint
		jshint: {
			options: {
				node: true
			},
			all: {
				src: [
					'gruntfile.js',
					// Modules
					'client/src/app/**/*.js',
					'client/src/app/*.js',
					// Components
					'client/components/**/*.js'
				]
			}
		},
		// Compiles LESS
		less: {
			dev: {
				files: {
					'client/dist/style.css': 'client/src/less/main.less'
				}
			},
			dist: {
				options: {
					cleancss: true,
          			compress: true
				},
				files: {
					'client/dist/style.css': 'client/src/less/main.less'
				}
			}
		},
		// Adds environment specific constants
		ngconstant: {
			// Options for all targets
			options: {
				space: '   ',
				wrap: '"use strict";\n\n {%= __ngModule %}',
				name: 'env'
			},
			// Environment targets
			dev: {
				options: {
					dest: 'client/tmp/env.js'
				},
				constants: {
					ENV: {
						name: 'development',
						github: {
							clientID: 'd727d15b77a4d3a01158',
							clientSecret: '305daf57c3b266f68ac9f932a64930205a1823c0'
						}
					}
				}
			},
			prod: {
				options: {
					dest: 'client/tmp/env.js'
				},
				constants: {
					ENV: {
						name: 'production',
						github: {
							clientID: '0d4b1f2056169b736e4f',
							clientSecret: 'd1a10bc32951a93f38b6f28feb8ad543052f104b'
						}
					}
				}
			}
		},
		// Starts BE server
		nodemon: {
			dev: {
				script: 'server/app.js',
				options: {
					ext: 'js, html'
				}
			}
		},
		// Minifies js
		uglify: {
			dist: {
				files: {
					'client/dist/app.js': ['client/dist/app.js']
				},
				options: {
					mangle: false
				}
			}
		},
		// Watches changes in files
		watch: {
			dev: {
				files: [
					'Grunfile.js',
					// App
					'client/src/app/*.js',
					// Index
					'client/*.html',
					// Components
					'client/src/components/**/*.js',
					// Components (templates)
					'client/src/components/**/*.tpl.html',
					// Components (less)
					'client/src/components/**/*.less',
					// Modules
					'client/src/app/**/*.js',
					// Modules (templates)
					'client/src/app/**/*.tpl.html',
					// Modules (LESS)
					'client/src/app/**/*.less',
					// LESS
					'client/src/less/*.less'
				],
				tasks: ['jshint', 'ngconstant:dev', 'html2js', 'copy', 'concat:dist', 'less:dev', 'clean:temp', 'uglify:dist'],
				options: {
					atBegin: true
				}
			},
			prod: {
				files: [
					'Grunfile.js',
					// App
					'client/src/app/*.js',
					// Index
					'client/*.html',
					// Components
					'client/src/components/**/*.js',
					// Components (templates)
					'client/src/components/**/*.tpl.html',
					// Components (less)
					'client/src/components/**/*.less',
					// Modules
					'client/src/app/**/*.js',
					// Modules (templates)
					'client/src/app/**/*.tpl.html',
					// Modules (LESS)
					'client/src/app/**/*.less',
					// LESS
					'client/src/less/*.less'
				],
				tasks: ['jshint', 'ngconstant:prod', 'html2js', 'copy', 'concat:dist', 'less:dev', 'clean:temp', 'uglify:dist'],
				options: {
					atBegin: true
				}
			}
		}
	});

	// Load grunt tasks automatically
	require('load-grunt-tasks')(grunt);

	// Default to force
	grunt.option('force', true);

	// Grunt for development
	grunt.registerTask('dev', function() {
		var nodemon = grunt.util.spawn({
	        cmd: 'grunt',
	        grunt: true,
	        args: 'nodemon'
	    });

	    nodemon.stdout.pipe(process.stdout);
    	nodemon.stderr.pipe(process.stderr);

		// grunt.task.run(['bower', 'connect:server', 'watch:dev']);
		grunt.task.run(['bower', 'watch:dev']);
	});

	// Grunt for production
	grunt.registerTask('prod', function() {
		var nodemon = grunt.util.spawn({
	        cmd: 'grunt',
	        grunt: true,
	        args: 'nodemon'
	    });

	    nodemon.stdout.pipe(process.stdout);
    	nodemon.stderr.pipe(process.stderr);

		grunt.task.run(['bower', 'watch:prod']);
	});

	// grunt.registerTask('minified', [ 'bower', 'connect:server', 'watch:min' ]);
	// grunt.registerTask('package', [ 'bower', 'jshint', 'karma:unit', 'html2js:dist', 'concat:dist', 'uglify:dist','clean:temp', 'compress:dist' ]);

};











