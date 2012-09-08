define(function() {
  return function(queryString) {
    var params = {};
    if (queryString && queryString.length && queryString.length > 0)
    {
      paramsStrings = queryString.split('&');
      for (var i = 0; i < paramsStrings.length; ++i)
      {
        var keyValuePair = paramsStrings[i].split('=');
        if (keyValuePair.length != 2) continue;
        params[keyValuePair[0]] = decodeURIComponent(keyValuePair[1].replace(/\+/g, " "));
      }
    }
    
    this.get = function(key) {
      return params[key];
    };
  };
});
