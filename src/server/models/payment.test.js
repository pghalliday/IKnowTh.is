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
      Payment.process(event, attendee, {
        description: 'payment details'
      }, function(error, payment) {
        should.not.exist(error, 'should not get an error');
        should.exist(payment, 'should have a payment object');
        should.exist(payment.dateAdded, 'payment object should have a date added field');
        payment.attendee.should.eql(attendee._id, 'payment object should have the correct attendee reference');
        payment.event.should.eql(event._id, 'payment object should have the correct event reference');
        should.exist(payment.details, 'payment object should have payment details');
        should.exist(payment.details.description, 'payment details should have description');
        payment.details.description.should.eql('payment details', 'payment details description should be correct');
        done();
      });
    });
    
    it('should error if the user has already paid for the event', function(done) {
      Payment.process(event, attendee, {
        description: 'first payment details'
      }, function(error, payment) {
        Payment.process(event, attendee, {
          description: 'second payment details'
        }, function(error, payment) {
          should.exist(error, 'error should exist');
          error.should.be.an.instanceOf(Error, 'error should be of type Error');
          error.toString().should.eql((new Error('Attendee cannot pay for an event twice')).toString(), 'Error should contain the correct message');
          should.exist(payment, 'should have a payment object');
          should.exist(payment.details, 'payment object should have payment details');
          should.exist(payment.details.description, 'payment details should have description');
          payment.details.description.should.eql('first payment details', 'payment details description should be from the first payment processed');
          done();
        });
      });
    });
    
    it('should error if the host tries to pay for their own event', function(done) {
      Payment.process(event, host, {
        description: 'payment details'
      }, function(error, payment) {
        should.exist(error, 'error should exist');
        error.should.be.an.instanceOf(Error, 'error should be of type Error');
        error.toString().should.eql((new Error('Host cannot pay to attend their own event')).toString(), 'Error should contain the correct message');
        should.not.exist(payment, 'payment should not exist');
        done();
      });
    });
  });
});
