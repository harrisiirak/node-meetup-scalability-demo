var http = require('http');
var argv = require('optimist').argv;

function sendMessage(user, msg) {
  var data = JSON.stringify({ type: 'msg', channel: 'quotes', from: user, content: msg });
  var options = {
    hostname: argv.host || config.host,
    port: argv.port || config.port,
    path: '/send',
    method: 'POST',
    headers: {
      'Content-Length': data.length,
      'Content-Type': 'application/json'
    },
    agent: false
  };

  var req = http.request(options, function(res) {
    res.setEncoding('utf8');
    console.log('Message sent: ' + data);
  });

  req.on('error', function(e) {
    console.log(e);
  });

  req.write(data);
  req.end();
}

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
  sendMessage('quote-bot', quotes[Math.ceil(Math.random() * quotes.length) - 1]);
}, 1000);
