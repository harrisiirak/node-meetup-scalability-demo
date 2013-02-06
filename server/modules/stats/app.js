var fs = require('fs');
var express = require('express');
var Chat = require('../../lib/chat');

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

    try {
      var stats = JSON.parse(data);
      var total = 0;
      var map = [];

      Object.keys(Chat._connections).forEach(function(host, index) {
        map.push({ host: host, count: Chat._connections[host] });
        total += Chat._connections[host];
      });

      function compare(a, b) {
        if (a.count > b.count) {
          return -1;
        } else if (a.count < b.count) {
          return 1;
        }

        return 0;
      }

      map.sort(compare);

      stats.network.c.total = total;
      stats.network.c.clients = map;
    } catch (e) {

    }

    res.end(JSON.stringify(stats));
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