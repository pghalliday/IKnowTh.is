define(['../utils/QueryString/QueryString'], function(QueryString) {
  return function(gapi, request, reporter, queryString) {
    var query = new QueryString(queryString);
    gapi.hangout.onApiReady.add(function(e) {
      if (e.isApiReady) {
        request.post('/startEvent/' + query.get('gd')).type('json').send({
            hangout: gapi.hangout.getHangoutUrl()
          }).end(function(res) {
          if (res.ok) {
            reporter.setMessage('Set hangout URL');
          } else {
            reporter.setMessage('Failed to set hangout URL');
          }
        });
      }
    });
  };
});

