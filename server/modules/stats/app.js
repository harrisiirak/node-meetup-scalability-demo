var fs = require('fs');
var express = require('express');

var app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use('/static/js', express.static(__dirname + '/static/js'));
app.use('/static/css', express.static(__dirname + '/static/css'));

app.get('/', function(req, res, next) {
  res.render('index');
});

app.get('/json', function(req, res, next) {
  fs.readFile('./stats.json', function(err, data) {
    if (err) {
      res.send(403, err.message);
      return;
    }

    res.end(data.toString());
  });
});

app.get('/client', function(req, res, next) {
  fs.readFile(__dirname + '/views/client.html', function(err, data) {
    if (err) {
      res.send(403, err.message);
      return;
    }

    res.end(data.toString());
  });
});

app.locals.pretty = true;
module.exports = app;