var http = require('http');
var config = require('./config.json');

function sendMessage(user, msg) {
  var options = {
    hostname: config.host,
    port: config.port,
    path: '/send',
    method: 'POST',
    agent: false
  };

  var req = http.request(options, function(res) {
    res.setEncoding('utf8');
  });

  req.on('error', function(e) {
    console.log(e);
  });

  req.write(JSON.stringify({ type: 'msg', channel: 'quotes', from: user, content: msg }));
  req.end();
}

for (var i = 0, c = config.clients; i < c; i++) {
  var options = {
    hostname: config.host,
    port: config.port,
    path: '/register?user=user' + (i + 1) + '&channel=quotes',
    method: 'GET',
    agent: false,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  var req = http.request(options, function(res) {
    res.setEncoding('utf8');

    res.on('data', function (chunk) {
      console.log(chunk.toString());
    });
  });

  req.on('error', function(e) {
    console.log(e);
  });

  setTimeout(function(i) {
    //sendMessage(('user' + (i + 1)), 'message 1');
  }, 5000, i);
  req.end();
}
