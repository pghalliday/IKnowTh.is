var Mocha = require('mocha');

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: '<json:package.json>',
		meta: {
			banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %>\n' + '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' + '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' + ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
		},
		lint: {
			files: ['grunt.js', 'src/dynamic/**/*.js']
		},
		mocha: {
			files: ['src/dynamic/**/*.js'] // pass in all files and let mocha find the tests (this is so that they are all removed from the require cache)
		},
		watch: {
			files: ['src/dynamic/**/*.js'],
			tasks: 'lint mocha'
		},
		jshint: {
			options: {
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				boss: true,
				eqnull: true,
				node: true,
				es5: true,
				predef: ["describe", // Used by mocha
				"it", // Used by mocha
				"before", // Used by mocha
				"beforeEach", // Used by mocha
				"after", // Used by mocha
				"afterEach" // Used by mocha
				]
			}
		},
		uglify: {}
	});

	// Mocha task.
	grunt.registerMultiTask('mocha', 'Run unit tests with Mocha', function() {
		var done = this.async(),
			mocha = new Mocha(),
			files = grunt.file.expandFiles(this.file.src);

		// clear the require cache in case we are run from watch
		grunt.file.clearRequireCache(files);

		// add files to mocha
		files.forEach(function(file) {
			// only add files that end with '.test.js'
			if (file.indexOf('.test.js') === (file.length - '.test.js'.length)) {				
				mocha.addFile(file);
			}
		});

		// run mocha asynchronously
		try {
			mocha.run(function(failureCount) {
				console.log('Mocha completed with ' + failureCount + ' failing tests');
				done(failureCount === 0);
			});			
		}  catch(e) {
			console.log('Mocha exploded!');
			console.log(e);
			done(false);
		}
	});

	// Default task.
	grunt.registerTask('default', 'lint mocha');

};
