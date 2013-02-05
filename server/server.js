var express = require('express');
var fs = require('fs');

var Chat = require('./lib/chat');

Chat.registerChannel('quotes', { announcements: false });
Chat.registerChannel('lobby', { announcements: true });

var app = express();
app.use(express.bodyParser());

app.get('/register', function(req, res, next) {
  Chat.listen(res, req.query.user, req.query.channel, function(err) {
    if (err) {
      return res.send(405, err.message);
    }

    res.writeHead(200, { 'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked' });
  });
});

app.post('/send', function(req, res, next) {
  var message = req.body;
  if (message) {
    Chat.findChannel(message.channel, function(err, channel) {
      channel.broadcast(message, function() {
        res.end();
      });
    });
  } else {
    res.send(500, 'No message');
  }
});

app.get('/users', function(req, res, next) {
  var message = req.body;
  if (message) {
    Chat.findChannel(message.channel, function(err, channel) {
      res.end();
    });
  } else {
    res.send(500, 'No message');
  }
});

app.use('/stats', require('./modules/stats/app'));
app.use('/chat', require('./modules/chat/app'));

app.listen(10000);
