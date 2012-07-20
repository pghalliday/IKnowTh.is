module.exports = function(grunt) {

  // Add our custom tasks.
  // These include:
  //		test - Run unit tests with Mocha (overrides the nodeunit test task)
  grunt.loadTasks('src/grunt');

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %>\n' + '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' + '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' + ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },
    lint: {
      files: ['grunt.js', 'src/grunt/**/*.js', 'src/server/**/*.js']
    },
    test: {
      files: ['src/server/**/*.test.js']
    },
    watch: {
      files: ['grunt.js', 'src/grunt/**/*.js', 'src/server/**/*.js'],
      tasks: 'lint test'
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
    mocha: {
      options: {
        reporter: 'nyan'        
      },
    }
  });

  // Default task.
  grunt.registerTask('default', 'lint test');

};
