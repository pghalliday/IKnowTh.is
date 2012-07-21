var mongoose = require('mongoose'),
    config = require('../config.js').properties,
    should = require('should'),
    Event = require('./event.js'),
    User = require('./user.js');

describe('Event', function() {

  var user1, user2, user3, event1, event2, event3;

  before(function(done) {
    // connect to a test database
    mongoose.connect('mongodb://localhost/UnitTest_Hangout_Event', done);
  });

  after(function(done) {
    mongoose.disconnect(done);
  });

  beforeEach(function(done) {
    User.remove({}, function(err) {
      if (err) {
        done(err);
      } else {
        Event.remove({}, function(err) {
          if (err) {
            done(err);
          } else {
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
                    user3 = new User({
                      id: 'testuser3',
                      name: 'test user2'
                    });
                    user3.save(function(err) {
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
                                user3.host({
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
              }
            });
          }
        });
      }
    });
  });

  describe('#addAttendee()', function() {
    it('should be not be possible to add the host as an attendee', function(done) {
      event1.addAttendee(user1, function(err, attendee) {
        should.not.exist(attendee);
        should.exist(err);
        err.should.be.an.instanceOf(Error);
        err.toString().should.eql((new Error('User cannot attend an event that they are hosting')).toString());
        event2.addAttendee(user1, function(err, attendee) {
          should.not.exist(attendee);
          should.exist(err);
          err.should.be.an.instanceOf(Error);
          err.toString().should.eql((new Error('User cannot attend an event that they are hosting')).toString());
          event3.addAttendee(user3, function(err, attendee) {
            should.not.exist(attendee);
            should.exist(err);
            err.should.be.an.instanceOf(Error);
            err.toString().should.eql((new Error('User cannot attend an event that they are hosting')).toString());
            done();
          });
        });
      });

    });

    it('should be possible to add a user that is not the host as an attendee', function(done) {
      event1.addAttendee(user2, function(err, attendee) {
        should.not.exist(err);
        event1.attendees.should.have.length(1);
        attendee.should.eql(event1.getAttendee(user2));
        event2.addAttendee(user2, function(err, attendee) {
          should.not.exist(err);
          event2.attendees.should.have.length(1);
          attendee.should.eql(event2.getAttendee(user2));
          event3.addAttendee(user2, function(err, attendee) {
            should.not.exist(err);
            event3.attendees.should.have.length(1);
            attendee.should.eql(event3.getAttendee(user2));
            done();
          });
        });
      });
    });

    it('should not be possible to add a user who is already attending as an attendee', function(done) {
      event1.addAttendee(user2, function(err, attendee) {
        if (err) {
          done(err);
        } else {
          event2.addAttendee(user2, function(err, attendee) {
            if (err) {
              done(err);
            } else {
              event3.addAttendee(user2, function(err, attendee) {
                if (err) {
                  done(err);
                } else {
                  event1.addAttendee(user2, function(err, attendee) {
                    should.not.exist(attendee);
                    should.exist(err);
                    err.should.be.an.instanceOf(Error);
                    err.toString().should.eql((new Error('User is already attending this event')).toString());
                    event2.addAttendee(user2, function(err, attendee) {
                      should.not.exist(attendee);
                      should.exist(err);
                      err.should.be.an.instanceOf(Error);
                      err.toString().should.eql((new Error('User is already attending this event')).toString());
                      event3.addAttendee(user2, function(err, attendee) {
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
    
    var createUsers = function(users, count, fn) {
      var user = new User({
        id: 'test',
        name: 'test'
      });
      user.save(function(err) {
        if (err) {
          fn(err);
        } else {
          users.push(user);
          count--;
          if (count > 0) {
            createUsers(users, count, function(err) {
              if (err) {
                fn(err);
              }
              else
              {
                fn();
              }
            });
          } else {
            fn();
          }
        }
      });
    };
    
    var addAttendees = function(event, users, count, fn) {
      event.addAttendee(users[count], function(err, attendee) {
        if (err) {
          fn(err);
        } else {
          count--;
          if (count > 0) {
            addAttendees(event, users, count, function(err) {
              if (err) {
                fn(err);
              } else {
                fn();
              }
            });
          } else {
            fn();
          }
        }
      });
    };

    it('should not be possible to add more than the maximum number of attendees to an event', function(done) {
      var users = [];
      createUsers(users, config.maximumAttendees + 1, function(err) {
        if (err) {
          done(err);
        } else {
          addAttendees(event1, users, config.maximumAttendees, function(err) {
            if (err) {
              done(err);
            } else {
              // should now be at the maximum number of users and only users[0] should not be attending
              event1.addAttendee(users[0], function(err, attendee) {
                should.not.exist(attendee);
                should.exist(err);
                err.should.be.an.instanceOf(Error);
                err.toString().should.eql((new Error('Maximum number of attendees has already been reached')).toString());
                done();
              });
            }
          });
        }
      });
    });
  });

  describe('attendees and hosts', function() {

    beforeEach(function(done) {
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
                  user3.attend(event1, function(err, attendee) {
                    if (err) {
                      done(err);
                    } else {
                      user3.attend(event2, done);
                    }
                  });
                }
              });
            }
          });
        }
      });
    });

    describe('#getAttendee()', function() {
      it('should return the attendee matching the given userId', function() {
        should.not.exist(event1.getAttendee(user1));
        event1.getAttendee(user2).should.have.property('userId', user2._id);
        event1.getAttendee(user3).should.have.property('userId', user3._id);
        should.not.exist(event2.getAttendee(user1));
        event2.getAttendee(user2).should.have.property('userId', user2._id);
        event2.getAttendee(user3).should.have.property('userId', user3._id);
        should.not.exist(event3.getAttendee(user1));
        event3.getAttendee(user2).should.have.property('userId', user2._id);
        should.not.exist(event3.getAttendee(user3));
      });
    });

    describe('#resetAttendees()', function() {
      it('should remove all attendees', function() {
        event1.attendees.should.have.property('length', 2);
        event1.resetAttendees(function(err, event) {
          event.attendees.should.have.property('length', 0);
        });
      });
    });

    describe('#hostedBy', function() {
      it('should only return events hosted by the given user', function(done) {
        Event.hostedBy(user1).find({}, function(err, events) {
          if (err) {
            done(err);
          } else {
            events.should.be.an.instanceOf(Array).with.length(2);
            Event.hostedBy(user2).find({}, function(err, events) {
              if (err) {
                done(err);
              } else {
                events.should.be.an.instanceOf(Array).with.length(0);
                Event.hostedBy(user3).find({}, function(err, events) {
                  if (err) {
                    done(err);
                  } else {
                    events.should.be.an.instanceOf(Array).with.length(1);
                    done();
                  }
                });
              }
            });
          }
        });
      });
    });

    describe('#attendedBy', function() {
      it('should only return events attended by the given user', function(done) {
        Event.attendedBy(user1).find({}, function(err, events) {
          if (err) {
            done(err);
          } else {
            events.should.be.an.instanceOf(Array).with.length(0);
            Event.attendedBy(user2).find({}, function(err, events) {
              if (err) {
                done(err);
              } else {
                events.should.be.an.instanceOf(Array).with.length(3);
                Event.attendedBy(user3).find({}, function(err, events) {
                  if (err) {
                    done(err);
                  } else {
                    events.should.be.an.instanceOf(Array).with.length(2);
                    done();
                  }
                });
              }
            });
          }
        });
      });
    });
  });
});
