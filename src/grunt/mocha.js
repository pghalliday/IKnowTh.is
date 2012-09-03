module.exports = function(grunt) {
  var Mocha = require('mocha');

  grunt.registerMultiTask('test', 'Run unit tests with Mocha', function() {
    // tell grunt this is an asynchronous task
    var done = this.async();

    // Clear all the files we can in the require cache in case we are run from watch.
    // NB. This is required to ensure that all tests are run and that all the modules under
    // test have been reloaded and are not in some kind of cached state
    for (var key in require.cache) {
      if (require.cache[key]) {
        delete require.cache[key];
        if (require.cache[key]) {
          console.warn('Mocha grunt task: Could not delete from require cache:\n' + key);
        }
      } else {
        console.warn('Mocha grunt task: Could not find key in require cache:\n' + key);
      }
    }

    // load the options if they are specified
    var options = grunt.config(['mocha', this.target, 'options']);
    if (typeof options !== 'object') {
      options = grunt.config('mocha.options');
    }

    // create a mocha instance with our options
    var mocha = new Mocha(options);

    // add files to mocha
    grunt.file.expandFiles(this.file.src).forEach(function(file) {
      mocha.addFile(file);
    });

    // run mocha asynchronously and catch errors!! (again, in case we are running this task in watch)
    try {      
      mocha.run(function(failureCount) {
        console.log('Mocha completed with ' + failureCount + ' failing tests');
        done(failureCount === 0);
      });
    } catch (e) {
      console.log('Mocha exploded!');
      console.log(e.stack);
      done(false);
    }
  });
};
