module.exports = function(grunt) {
	var Mocha = require('mocha');
	
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
};
