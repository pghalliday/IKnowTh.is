exports.index = function(req, res){
  res.render('index', { title: 'Hangout' })
};

exports.book = function(req, res){
  res.render('book', { title: 'Hangout' })
};