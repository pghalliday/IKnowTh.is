define(['Hangout'], function(Hangout) {
  return {
    run: function() {
      test( "hello test", function() {
        var hangout = new Hangout();
        ok(hangout.hello() === "hello", "Passed!");
      });  
    }
  };
});

