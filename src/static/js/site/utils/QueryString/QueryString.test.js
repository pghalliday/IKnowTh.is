define(['QueryString'], function(QueryString) {
  return {
    run: function() {
      test('get gd parameter test', function() {
        var queryString = new QueryString('hello=hello&boo=boo+to+you&gd=a+gd+value&some=thing');
        equal(queryString.get('gd'), 'a gd value', 'Passed!');
      });  
    }
  };
});

