describe('Payment', function() {
  var mongoose = require('mongoose'),
      should = require('should'),
      User = require('./user.js'),
      Event = require('./event.js'),
      Payment = require('./payment.js');

  var host, attendee, event;

  before(function(done) {
    // connect to a test database
    mongoose.connect('mongodb://localhost/UnitTest_Hangout_Payment', function(error) {
      if (error) {
        done(error);
      } else {    
        // remove all users
        User.remove({}, function(error) {
          if (error) {
            done(error);
          } else {
            // remove all events
            Event.remove({}, function(error) {
              if (error) {
                done(error);
              } else {
                // add a host
                host = new User({
                  id: 'host',
                  name: 'host user'
                });
                host.save(function(error) {
                  if (error) {
                    done(error);
                  } else {
                    // add an attendee
                    attendee = new User({
                      id: 'attendee',
                      name: 'attendee user'
                    });
                    attendee.save(function(error) {
                      if (error) {
                        done(error);
                      } else {
                        // add an event
                        host.host({
                          name: 'event',
                          description: 'description',
                          date: 1342818000   
                        }, function(error, newEvent) {
                          if (error) {
                            done(error);
                          } else {
                            event = newEvent;
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
  });

  after(function(done) {
    // disconnect from the database
    mongoose.disconnect(done);
  });

  beforeEach(function(done) {
    // remove all payment records from the database
    Payment.remove({}, done);
  });

  describe('#processPayment()', function() {
    it('should add a new payment record', function(done) {
      done();
    });
    it('should error if the user has already paid for the event', function(done) {
      done();
    });
    it('should error if the host tries to pay for their own event', function(done) {
      done();
    });
  });
});
