describe('User', function() {
  var mongoose = require('mongoose'),
      should = require('should'),
      User = require('./user.js'),
      Event = require('./event.js');

  before(function(done) {
    // connect to a test database
    mongoose.connect('mongodb://localhost/UnitTest_Hangout_User', done);
  });

  after(function(done) {
    mongoose.disconnect(done);
  });

  beforeEach(function(done) {
    User.remove({}, function(err) {
      if (err) {
        done(err);
      } else {
        Event.remove({}, done);
      }
    });
  });
  
  describe('#findOrCreateFromGoogleData()', function() {
    it('should return a matching existing user or create a new one', function(done) {
      User.findOrCreateFromGoogleData({
        id: 'testuser1',
        name: 'name 1'
      }, function(err, user) {
        if (err) {
          done(err);
        } else {
          var user1 = user;
          user1.profile.name.should.eql('name 1');
          User.findOrCreateFromGoogleData({
            id: 'testuser2',
            name: 'name 2'
          }, function(err, user) {
            if (err) {
              done(err);
            } else {
              var user2 = user;
              user2.profile.name.should.eql('name 2');
              User.findOrCreateFromGoogleData({
                id: 'testuser1',
                name: 'name 3'
              }, function (err, user) {
                if (err) {
                  done(err);
                } else {
                  var user3 = user;
                  user3.profile.name.should.eql('name 3');
                  user1._id.should.eql(user3._id);
                  user1._id.should.not.eql(user2._id);
                  done();
                }
              });
            }
          });
        }
      });
    });
  });

  describe('#host()', function() {
    it('should add a new event hosted by the user', function(done) {
      var user = new User({
        id: 'testuser',
        name: 'test user'
      });
      user.save(function(err) {
        if (err) {
          done(err);
        } else {
          user.host({
            name: 'test event',
            description: 'test event description',
            date: 1342818000
          }, function(err, event) {
            if (err) {
              done(err);
            } else {
              event.should.have.property('host', user._id);
              event.should.have.property('name', 'test event');
              event.should.have.property('description', 'test event description');
              event.should.have.property('date').with.eql(new Date(1342818000));
              event.should.have.property('image');
              event.image.should.not.have.property('data').and.should.not.have.property('contentType');
              event.should.not.have.property('hangout');
              event.should.have.property('attendees').with.length(0);
              done();
            }
          });
        }
      });
    });
  });

  describe('Events', function() {

    var user1, user2, event1, event2, event3;

    // populate some data before running the next tests on event hosting and attendance
    beforeEach(function(done) {
      user1 = new User({
        id: 'testuser1',
        name: 'test user1'
      });
      user1.save(function(err) {
        if (err) {
          done(err);
        } else {
          user2 = new User({
            id: 'testuser2',
            name: 'test user2'
          });
          user2.save(function(err) {
            if (err) {
              done(err);
            } else {
              user1.host({
                name: 'test event 1',
                description: 'test event description',
                date: 1342818000
              }, function(err, event) {
                if (err) {
                  done(err);
                } else {
                  event1 = event;
                  user1.host({
                    name: 'test event 2',
                    description: 'test event description',
                    date: 1342818000
                  }, function(err, event) {
                    if (err) {
                      done(err);
                    } else {
                      event2 = event;
                      user1.host({
                        name: 'test event 3',
                        description: 'test event description',
                        date: 1342818000
                      }, function(err, event) {
                        if (err) {
                          done(err);
                        } else {
                          event3 = event;
                          done();
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    });

    describe('#getHostedEvents()', function() {
      it('should return an aray of events hosted by this user', function(done) {
        user1.getHostedEvents(function(err, events) {
          if (err) {
            done(err);
          } else {
            events.should.be.an.instanceOf(Array).with.length(3);
            done();
          }
        });
      });
    });

    describe('#attend()', function() {
      it('should not be possible to attend event that the user is hosting', function(done) {
        user1.attend(event1, function(err, attendee) {
          should.not.exist(attendee);
          should.exist(err);
          err.should.be.an.instanceOf(Error);
          err.toString().should.eql((new Error('User cannot attend an event that they are hosting')).toString());
          user1.attend(event2, function(err, attendee) {
            should.not.exist(attendee);
            should.exist(err);
            err.should.be.an.instanceOf(Error);
            err.toString().should.eql((new Error('User cannot attend an event that they are hosting')).toString());
            user1.attend(event3, function(err, attendee) {
              should.not.exist(attendee);
              should.exist(err);
              err.should.be.an.instanceOf(Error);
              err.toString().should.eql((new Error('User cannot attend an event that they are hosting')).toString());
              done();
            });
          });
        });
      });

      it('should be possible to attend an event that the user is not hosting', function(done) {
        user2.attend(event1, function(err, attendee) {
          should.not.exist(err);
          event1.attendees.should.have.length(1);
          should.exist(attendee);
          attendee.should.eql(event1.getAttendee(user2));
          user2.attend(event2, function(err, attendee) {
            should.not.exist(err);
            event2.attendees.should.have.length(1);
            should.exist(attendee);
            attendee.should.eql(event2.getAttendee(user2));
            user2.attend(event3, function(err, attendee) {
              should.not.exist(err);
              event3.attendees.should.have.length(1);
              should.exist(attendee);
              attendee.should.eql(event3.getAttendee(user2));
              done();
            });
          });
        });
      });

      it('should not be possible to attend an event that the user is already attending', function(done) {
        user2.attend(event1, function(err, attendee) {
          if (err) {
            done(err);
          } else {
            user2.attend(event2, function(err, attendee) {
              if (err) {
                done(err);
              } else {
                user2.attend(event3, function(err, attendee) {
                  if (err) {
                    done(err);
                  } else {
                    user2.attend(event1, function(err, attendee) {
                      should.not.exist(attendee);
                      should.exist(err);
                      err.should.be.an.instanceOf(Error);
                      err.toString().should.eql((new Error('User is already attending this event')).toString());
                      user2.attend(event2, function(err, attendee) {
                        should.not.exist(attendee);
                        should.exist(err);
                        err.should.be.an.instanceOf(Error);
                        err.toString().should.eql((new Error('User is already attending this event')).toString());
                        user2.attend(event3, function(err, attendee) {
                          should.not.exist(attendee);
                          should.exist(err);
                          err.should.be.an.instanceOf(Error);
                          err.toString().should.eql((new Error('User is already attending this event')).toString());
                          done();
                        });
                      });
                    });
                  }                                        
                });
              }
            });
          }
        });
      });
    });

    describe('#getAttendedEvents()', function() {
      it('should return an array of events attended by this user', function(done) {
        user2.attend(event1, function(err, attendee) {
          user2.getAttendedEvents(function(err, events) {
            if (err) {
              done(err);
            } else {
              events.should.be.an.instanceOf(Array).with.length(1);
              user2.attend(event2, function(err, attendee) {
                user2.getAttendedEvents(function(err, events) {
                  if (err) {
                    done(err);
                  } else {
                    events.should.be.an.instanceOf(Array).with.length(2);
                    user2.attend(event3, function(err, attendee) {
                      user2.getAttendedEvents(function(err, events) {
                        if (err) {
                          done(err);
                        } else {
                          events.should.be.an.instanceOf(Array).with.length(3);
                          done();
                        }
                      });
                    });
                  }
                });
              });
            }
          });
        });
      });
    });
  });
});
