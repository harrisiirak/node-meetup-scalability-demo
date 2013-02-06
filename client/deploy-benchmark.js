#!/usr/bin/env node
var argv = require('optimist').argv;
var Shync = require('shync').Shync;
var async = require('async');
var nl = require('nodeload');

var server = {
  host: '176.58.101.215',
  port: 10000
};

var clients = [ '109.74.200.37', '178.79.180.13', '178.79.173.227', '178.79.132.159', '178.79.140.241' ];
//var clients = [ '109.74.200.37' ];

var cluster = new Shync({
  domains: clients,
  user: 'root',
  keyLoc: '~/.ssh/id_rsa.pub',
  bypassFingerprint: true
});

function startTest() {
  var testClients = [];
  clients.forEach(function(client, index) {
    testClients.push(client + ':8000');
  });

  var cluster = new nl.LoadTestCluster('localhost:8000', testClients);
  var loadtest = cluster.run({
      host: server.host,
      port: server.port,
      timeLimit: 6000,
      userProfile: [
        [ 0, 100 ],
        [ 80, 3800 ],
        [ 140, 5000 ],
        [ 200, 6800 ],
        [ 240, 8000 ],
        [ 270, 8500 ]
      ],
      requestGenerator: function(client) {
        var req = client.request('GET', '/register?user=user' + (Math.round(Math.random() * 10000000)) + '&channel=quotes');

        req.on('response', function(res) {
          res.on('data', function(chunk) {
            //console.log(chunk.toString());
          });
        });

        req.on('error', function(err) {
        });

        req.end();
        return req;
      }
  });
}

switch (argv.command) {
  case 'stop':
    async.waterfall([
      function(next) {
        console.log('Stopping test clients');
        cluster.run('cd /opt/meetup/nodeload/ && forever stop nodeload.js', function(code) {
          return code !== 0 ? next(new Error('Client not restarted')) : next(null);
        });
      }
    ],
    function(err) {
      if (err) {
        console.log('Error: ' + err.message);
      }
    });
    break;

  case 'start':
    async.waterfall([
      function(next) {
        console.log('Removing test clients files');
        cluster.run('rm -fr /opt/meetup/nodeload', function(code) {
          return next(null);
        });
      },

      function(next) {
        console.log('Redeploying test clients files');
        cluster.run('git clone https://github.com/harrisiirak/nodeload.git /opt/meetup/nodeload', function(code) {
          return code !== 0 ? next(new Error('Client not updated')) : next(null);
        });
      },

      function(next) {
        console.log('Installing dependencies step #1');
        cluster.run('cd /opt/meetup/nodeload/ && npm install', function(code) {
          return code !== 0 ? next(new Error('Modules not updated')) : next(null);
        });
      },

      function(next) {
        console.log('Installing dependencies step #2');
        cluster.run('cd /opt/meetup/nodeload/ && make all', function(code) {
          return code !== 0 ? next(new Error('Modules not updated')) : next(null);
        });
      },

      function(next) {
        console.log('Starting test clients');
        cluster.run('cd /opt/meetup/nodeload/ && forever start nodeload.js', function(code) {
          return code !== 0 ? next(new Error('Client not restarted')) : next(null);
        });
      },

      function(next) {
        setTimeout(startTest, 5000);
      }
    ],
    function(err) {
      console.log('Error: ' + err.message);
    });
    break;

  case 'reload':
    async.waterfall([
      function(next) {
        console.log('Stopping test clients');
        cluster.run('cd /opt/meetup/nodeload/ && forever stop nodeload.js', function(code) {
          return code !== 0 ? next(new Error('Client not stopped')) : next(null);
        });
      },

      function(next) {
        console.log('Starting test clients');
        cluster.run('cd /opt/meetup/nodeload/ && forever start nodeload.js', function(code) {
          return code !== 0 ? next(new Error('Client not started')) : next(null);
        });
      },

      function(next) {
        setTimeout(startTest, 5000);
      }
    ],
    function(err) {
      console.log('Error: ' + err.message);
    });
    break;

  case 'run':
    setTimeout(startTest, 5000);
    break;
}
