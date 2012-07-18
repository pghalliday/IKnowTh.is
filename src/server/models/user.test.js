var mongoose = require('./testUtils/mongoose.js'),
	should = require('should'),
	User;

describe('Event', function() {
	beforeEach(function(done) {
		// reset the schemas to ensure that any changes are picked up by the mongoose singleton
		mongoose.resetSchemas();

		// add the schemas back again
		User = require('./user.js');

		// connect to a test database and drop all the users from it
		mongoose.connect('mongodb://localhost/UnitTest_Hangout_Event');
		User.remove({}, function(err) {
			done();
		});
	});

	describe('#findOrCreateFromGoogleData()', function() {
		it('should return a matching existing user or create a new one', function(done) {
			var promise = {
				fulfill: function(user) {
					var user1 = user;
					var promise = {
						fulfill: function(user) {
							var user2 = user;
							var promise = {
								fulfill: function(user) {
									var user3 = user;
									user1._id.should.eql(user3._id);
									user1._id.should.not.eql(user2._id);
									done();
								},
								fail: function() {
									done(new Error('Find user1 failed'));
								}
							};
							User.findOrCreateFromGoogleData({
								id: 'testuser1',
								name: 'test user1'
							}, promise);
						},
						fail: function() {
							done(new Error('Create user2 failed'));
						}
					};
					User.findOrCreateFromGoogleData({
						id: 'testuser2',
						name: 'test user2'
					}, promise);
				},
				fail: function() {
					done(new Error('Create user1 failed'));
				}
			};
			User.findOrCreateFromGoogleData({
				id: 'testuser1',
				name: 'test user1'
			}, promise);
		});
	});
	
	afterEach(function(done) {
		mongoose.disconnect(function() {
			done();
		});	
	});
});
