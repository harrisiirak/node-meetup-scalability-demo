var express = require('express');
var argv = require('optimist').argv;
var cluster = require('cluster');
var fs = require('fs');
var os = require('os');

var Chat = require('./lib/chat');

Chat.registerChannel('quotes', { announcements: false });
Chat.registerChannel('lobby', { announcements: true });

function createServer() {
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

  app.listen(10001);
}

if (argv.cluster) {
  function onMessage(message) {
    console.log(arguments);
  }

  function onExit(message) {
    console.log(arguments);
  }

  if (cluster.isMaster) {
    for (var i = 0, c = os.cpus().length; i < c; i++) {
      cluster.fork();
    }

    Object.keys(cluster.workers).forEach(function(id) {
      cluster.workers[id].on('message', onMessage);
      cluster.workers[id].on('exit', onExit);
    });

    console.log('ok');
  } else {
    createServer();
  }
} else {
  createServer();
}
