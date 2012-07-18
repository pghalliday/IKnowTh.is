/*global gapi:false*/

function getParameter(paramName) {
  var searchString = window.location.search.substring(1),
      i, val, params = searchString.split('&');

  for (i = 0; i < params.length; i++) {
    val = params[i].split('=');
    if (val[0] === paramName) {
      return decodeURIComponent(val[1]);
    }
  }
  return null;
}

function onApiReady() {
  $.ajax({
    url: '/startEvent/' + getParameter('gd'),
    dataType: 'json',
    type: 'POST',
    data: {
      'hangout': gapi.hangout.getHangoutUrl()
    }
  }).done(function(data, status, xhr) {
    $('#msg').html(data.msg);
  }).fail(function(xhr, status, error) {
    $('#msg').html("Error: " + status);
  });
}

function onClientReady() {
  gapi.hangout.onApiReady.add(function(e) {
    if (e.isApiReady) {
      onApiReady();
    }
  });
}
