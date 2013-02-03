var express = require('express');
var fs = require('fs');
var querystring = require('querystring');

var Chat = require('./lib/chat');

Chat.registerChannel('quotes', true);
Chat.registerChannel('lobby');

var quotes = [
  'You can do anything, but not everything.',
  'Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.',
  'The richest man is not he who has the most, but he who needs the least.',
  'You miss 100 percent of the shots you never take.',
  'Courage is not the absence of fear, but rather the judgement that something else is more important than fear.',
  'You must be the change you wish to see in the world.',
  'When hungry, eat your rice; when tired, close your eyes. Fools may laugh at me, but wise men will know what I mean.',
  'The third-rate mind is only happy when it is thinking with the majority. The second-rate mind is only happy when it is thinking with the minority. The first-rate mind is only happy when it is thinking.',
  'To the man who only has a hammer, everything he encounters begins to look like a nail.'
];

setInterval(function() {
  Chat.findChannel('quotes', function(err, channel) {
    var message = {
      type: 'msg',
      from: 'server',
      content: quotes[Math.ceil(Math.random() * quotes.length) - 1]
    };

    channel.broadcast(message, function() {
    });
  });
}, 30000);

setInterval(function() {
  Chat.findChannel('quotes', function(err, channel) {
    channel.stats(function(err, info) {
      console.log('Users: ' + info.users);
    });
  });
}, 5000);

var app = express();

app.get('/register', function(req, res, next) {
  Chat.listen(res, req.query.user, req.query.channel, function(err) {
    if (err) {
      return res.send(405, err.message);
    }

    res.writeHead(200, { 'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked' });
  });
});

app.post('/send', function(req, res, next) {
  var message = res.body;
  if (message) {
    Chat.findChannel(message.channel, function(err, channel) {
      channel.broadcast(message, function() {
        res.end();
      });
    });
  }
});

app.use('/stats', require('./modules/stats/app'));

app.listen(10000);