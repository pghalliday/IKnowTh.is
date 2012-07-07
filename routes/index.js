var Expert = require('../models/expert.js');

exports.index = function(req, res){
  res.render('index', { title: 'Hangout' })
};

exports.book = function(req, res){
  res.render('book', { title: 'Hangout' })
};

exports.expertDetails = function(req, res){
  Expert.findOne({_id: req.params.id}, function(error, expert) {
        res.render('expertDetails', { title: 'Hangout', expert: expert });
    })
};

exports.registerExpert = function(req, res){
  res.render('registerExpert', { title: 'Hangout' })
};

exports.registerExpertPost = function(req, res){
  console.log("name %s expertise %s", req.body.name, req.body.expertise);
  var expert = new Expert({name: req.body.name, expertise: req.body.expertise});
  expert.save();
  res.redirect('/expertDetails/' + expert._id)
};