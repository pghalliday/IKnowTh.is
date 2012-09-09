define(['Hangout'], function(Hangout) {
  return {
    run: function() {
      asyncTest('Failed to set hangout URL', function() {
        var superAgentMock = new SuperAgentMock(true);
        var hangout = new Hangout(gapiMock, superAgentMock, reporter, 'gd=123456');
        gapiMock.apiReady(function() {
          equal(superAgentMock.testUrl, '/startEvent/123456');
          equal(superAgentMock.testType, 'json');
          deepEqual(superAgentMock.testData, {
            hangout: 'https://plus.google.com/hangouts/_/a1b58790983a93ec3421075d9fffd34e3c281741?authuser=0&hl=en-GB'
          });
          equal(reporter.message, 'Failed to set hangout URL');
          QUnit.start();
        });
      });

      asyncTest('Set hangout URL', function() {
        var superAgentMock = new SuperAgentMock(false);
        var hangout = new Hangout(gapiMock, superAgentMock, reporter, 'gd=123456');
        gapiMock.apiReady(function() {
          equal(superAgentMock.testUrl, '/startEvent/123456');
          equal(superAgentMock.testType, 'json');
          deepEqual(superAgentMock.testData, {
            hangout: 'https://plus.google.com/hangouts/_/a1b58790983a93ec3421075d9fffd34e3c281741?authuser=0&hl=en-GB'
          });
          equal(reporter.message, 'Set hangout URL');
          QUnit.start();
        });
      });

      var reporter = {
        setMessage: function(message) {
          this.message = message;
          gapiMock.apiReadyDone();
        }
      };

      var SuperAgentMock = function(fail) {
        var self = this;
        self.post = function(url) {
          self.testUrl = url;
          return {
            type: function(type) {
              self.testType = type;
              return {
                send: function(data) {
                  self.testData = data;
                  return {
                    end: function(callback) {
                      if (fail) {
                        callback({
                          ok: false
                        });
                      } else {
                        callback({
                          ok: true
                        });
                      }
                    }
                  };
                }
              };
            }
          };
        };
      };

      var gapiMock = {
        hangout: {
          onApiReady: {
            add: function(callback) {
              gapiMock.callback = callback;
            }
          },
          getHangoutUrl: function() {
            return 'https://plus.google.com/hangouts/_/a1b58790983a93ec3421075d9fffd34e3c281741?authuser=0&hl=en-GB';
          }
        },
        apiReady: function(done) {
          gapiMock.done = done;
          gapiMock.callback({
            isApiReady: true
          });
        },
        apiReadyDone: function() {
          gapiMock.done();
        }
      };
    }
  };
});

