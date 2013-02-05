var express = require('express');

var app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use('/static/bootstrap/css', express.static(__dirname + '/static/bootstrap/css'));
app.use('/static/bootstrap/img', express.static(__dirname + '/static/bootstrap/img'));
app.use('/static/bootstrap/js', express.static(__dirname + '/static/bootstrap/js'));

app.use('/static/js', express.static(__dirname + '/static/js'));
app.use('/static/css', express.static(__dirname + '/static/css'));


app.get('/', function(req, res, next) {
  res.render('index');
});

// handle partials for Angular
app.get('/partials/:filename', function(req, res){
  var filename = req.params.filename;
  if(!filename) return;  // might want to change this
  res.render("partials/"+ filename);
});
  
module.exports = app;