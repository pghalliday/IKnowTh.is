var mongoose = require('./testUtils/mongooseTestWrapper.js'),
	Event,
	User;

exports.setUp = function(callback) {
	// reset the schemas to ensure that any changes are picked up by the mongoose singleton
	mongoose.resetSchemas();
	
	// add the schemas back again
	Event = require('./event.js');
	User = require('./user.js');
	
	// connect to a test database and drop all the users and events from it
	mongoose.connect('mongodb://localhost/UnitTest_Hangout_Event');
	User.remove({}, function(err) {
		Event.remove({}, function(err) {
			callback();
		});
	});
};

exports.tearDown = function(callback) {
	mongoose.disconnect();
	callback();
};

exports.getAttendee = function(test) {
	test.expect(4);
	var user1 = new User({
		id: 'testuser2',
		name: 'test user'
	});
	var user2 = new User({
		id: 'testuser1',
		name: 'test user'
	});
	var event = new Event({
		name: 'test event'
	});
	event.attendees.push({
		userId: user1._id
	});
	event.attendees.push({
		userId: user2._id
	});
	var attendee = event.getAttendee(user1._id);
	test.ok(attendee.userId.equals(user1._id));
	test.ok(!attendee.userId.equals(user2._id));
	attendee = event.getAttendee(user2._id);
	test.ok(!attendee.userId.equals(user1._id));
	test.ok(attendee.userId.equals(user2._id));
	test.done();
};

exports.resetAttendees = function(test) {
	test.expect(2);
	var user1 = new User({
		id: 'testuser2',
		name: 'test user'
	});
	var user2 = new User({
		id: 'testuser1',
		name: 'test user'
	});
	var event = new Event({
		name: 'test event'
	});
	event.attendees.push({
		userId: user1._id
	});
	event.attendees.push({
		userId: user2._id
	});
	test.equal(2, event.attendees.length);
	event.resetAttendees();
	test.equal(0, event.attendees.length);
	test.done();
};

exports.testMethodsWorkWithRetrievedInstances = function(test) {
	test.expect(3);
	var user = new User({
		id: 'testuser',
		name: 'test user'
	});
	user.save();
	var event = new Event({
		test: 'hello',
		name: 'test'
	});
	event.save();
	event.attendees.push({
		userId: user._id
	});
	Event.findOne({
		name: 'test'
	}, function(error, foundEvent) {
		if (error) {
			test.done();
		} else {
			if (foundEvent) {
				test.ok(event._id.equals(foundEvent._id));
				test.equal(event.test, 'hello');
				var attendee = event.getAttendee(user._id);
				test.ok(attendee.userId.equals(user._id));
				test.done();
			} else {
				test.done();
			}
		}
	});
};