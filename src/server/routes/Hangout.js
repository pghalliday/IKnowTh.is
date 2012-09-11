module.exports = function(title) {
  this.get = function(req, res) {
    res.render('hangout', {
      user: req.user,
      layout: false,
      title: title
    });
  };
};
