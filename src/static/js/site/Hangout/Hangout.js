define(function() {
  return function() {
    this.hello = function() {
      return 'hello';
    };
  };
/*  return function(gapi) {
    gapi.hangout.onApiReady.add(function(e) {
      if (e.isApiReady) {
      }
    });
  };*/
});

