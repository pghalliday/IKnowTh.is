define(['GoogleWalletWrapper'], function(GoogleWalletWrapper) {
  return {
    run: function() {
      test( "hello test", function() {
        var googleWalletWrapper = new GoogleWalletWrapper();
        ok(googleWalletWrapper.hello() === "hello", "Passed!");
      });  
    }
  };
});

