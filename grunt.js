var nodeFiles = ['grunt.js', 'app.js', 'config.js', 'models/**/*.js', 'routes/**/*.js'];
var nodeTestFiles = [];
nodeFiles.forEach(function(nodeFile) {
	nodeTestFiles.push(nodeFile.replace('.js', '.test.js'));
});
nodeFiles.push(nodeTestFiles);
var browserFiles = ['public/js/hangout.js'];

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: '<json:package.json>',
		meta: {
			banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %>\n' + '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' + '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' + ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
		},
		lint: {
			node: nodeFiles,
			browser: browserFiles
		},
		test: {
			files: nodeTestFiles
		},
		qunit: {
			files: ['**/*.test.html']
		},
		watch: {
			node: {
				files: nodeFiles,
				tasks: 'lint:node test'
			},
			browser: {
				files: browserFiles,
				tasks: 'lint:browser qunit'
			}
		},
		jshint: {
			node: {
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
					es5: true
				}
			},
			browser: {
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
					browser: true,
					jquery: true
				}
			}
		},
		uglify: {}
	});

	// Default task.
	grunt.registerTask('default', 'lint test qunit');

};
