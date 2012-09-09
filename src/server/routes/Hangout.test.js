describe('Hangout', function() {
  var Hangout = require('./Hangout'); 
  var hangout = new Hangout('title');
  
  describe('#get()', function() {
    it('should render with the correct properties', function(done) {
      hangout.get(request, response);
      response.rendered.should.eql({
        view: 'hangout',
        params: {
          layout: false,
          title: 'title'
        }
      });
      done();
    });
  });
  
  var request = {};
  var response = {
    render: function(view, params) {
      this.rendered = {
        view: view,
        params: params
      };
    }
  };
});
