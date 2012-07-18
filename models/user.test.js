var mongoose = require('./testUtils/mongooseTestWrapper.js'),
	User;

exports.setUp = function(callback) {
	// reset the schemas to ensure that any changes are picked up by the mongoose singleton
	mongoose.resetSchemas();

	// add the schemas back again
	User = require('./user.js');

	// connect to a test database and drop all the users from it
	mongoose.connect('mongodb://localhost/UnitTest_Hangout_User');
	User.remove({}, function(err) {
		callback();
	});
};

exports.tearDown = function(callback) {
	mongoose.connection.close();
	callback();
};

exports.findOrCreateFromGoogleData = function(test) {
	test.expect(2);
	var promise = {
		fulfill: function(user) {
			var user1 = user;
			var promise = {
				fulfill: function(user) {
					var user2 = user;
					var promise = {
						fulfill: function(user) {
							var user3 = user;
							test.ok(user1._id.equals(user3._id));
							test.ok(!user1._id.equals(user2._id));
							test.done();
						},
						fail: function() {
							test.done();
						}
					};
					User.findOrCreateFromGoogleData({
						id: 'testuser1',
						name: 'test user1'
					}, promise);
				},
				fail: function() {
					test.done();
				}
			};
			User.findOrCreateFromGoogleData({
				id: 'testuser2',
				name: 'test user2'
			}, promise);
		},
		fail: function() {
			test.done();
		}
	};
	User.findOrCreateFromGoogleData({
		id: 'testuser1',
		name: 'test user1'
	}, promise);
};
