module.exports = function(title) {
  this.get = function(req, res) {
    res.render('hangout', {
      layout: false,
      title: title
    });
  };
};
