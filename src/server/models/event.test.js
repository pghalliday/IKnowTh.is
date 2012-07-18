var mongoose = require('./testUtils/mongoose.js'),
    should = require('should'),
    Event, User;

describe('Event', function() {
  beforeEach(function(done) {
    // reset the schemas to ensure that any changes are picked up by the mongoose singleton
    mongoose.resetSchemas();

    // add the schemas back again
    Event = require('./event.js');
    User = require('./user.js');

    // connect to a test database and drop all the users and events from it
    mongoose.connect('mongodb://localhost/UnitTest_Hangout_Event');
    User.remove({}, function(err) {
      Event.remove({}, function(err) {
        done();
      });
    });
  });

  describe('#getAttendee()', function() {
    it('should return the attendee matching the given userId', function() {
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
      attendee.should.have.property('userId', user1._id);
      attendee.should.not.have.property('userId', user2._id);

      attendee = event.getAttendee(user2._id);
      attendee.should.not.have.property('userId', user1._id);
      attendee.should.have.property('userId', user2._id);
    });
  });

  describe('#resetAttendees()', function() {
    it('should remove all attendees', function() {
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

      event.attendees.should.have.property('length', 2);
      event.resetAttendees();
      event.attendees.should.have.property('length', 0);
    });
  });

  afterEach(function(done) {
    mongoose.disconnect(function() {
      done();
    });
  });
});
