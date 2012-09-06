module.exports = function() {
  this.error = function(request, errorType, callback) {
    callback({
      request: request,
      response: {
        errorType: errorType
      }
    });
  };
  
  this.success = function(request, orderId, jwt, callback) {
    callback({
      request: request,
      response: {
        orderId: orderId
      },
      jwt: jwt
    });
  };
};