var exec = require('child_process').exec;
var async = require('async');
var util = require('util');
var fs = require('fs');

var stats = {
  memory: {
    free: 0,
    used: 0,
    total: 0
  },
  network: {
    tx: 0,
    rx: 0,
    c: {
      total: 0,
      clients: []
    }
  },
  load: ''
};

var speed =  { tx: 0, rx: 0 };
var collectingConnections = false;

setInterval(function() {
  async.waterfall([
    function(next) {
      if (!collectingConnections) {
        collectingConnections = true;

        exec('netstat -ntu | grep :10000 | awk \'{print $5}\' | cut -d: -f1 | sort | uniq -c | sort -n -r',
          function(err, stdout, stderr) {
            var total = 0;
            var clients = [];
            var lines = stdout.split('\n');

            lines.forEach(function(line, index) {
              line = line.replace(/^\s+|\s+$/g, '');

              var atoms = line.split(' ');
              if (atoms.length !== 2) {
                return;
              }

              clients.push({ host: atoms[1], count: atoms[0] });
              total += parseInt(atoms[0]);
            });

            stats.network.c.total = total;
            stats.network.c.clients = clients;
            collectingConnections = false;
          }
        );
      } else {
        next();
      }
    },

    function(next) {
      exec('cat /proc/loadavg | cut -d" " -f 1-3',
        function(err, stdout, stderr) {
          stats.load = stdout.replace('\n', '');
          next();
        }
      );
    },

    function(next) {
      exec('cat /sys/class/net/eth0/statistics/rx_bytes && cat /sys/class/net/eth0/statistics/tx_bytes',
        function(err, stdout, stderr) {
          var atoms = stdout.split('\n');

          if (speed.tx && speed.rx) {
            stats.network.rx = parseInt(atoms[0]) - speed.rx;
            stats.network.tx = parseInt(atoms[1]) - speed.tx;
          }

          speed.rx = parseInt(atoms[0]);
          speed.tx = parseInt(atoms[1]);

          next();
        }
      );
    },

    function(next) {
      exec('cat /proc/meminfo | awk \'/^MemTotal:/ {print $2}\' && cat /proc/meminfo | awk \'/^MemFree:/ {print $2}\'',
        function(err, stdout, stderr) {
          var atoms = stdout.split('\n');
          stats.memory.total = parseInt(atoms[0]);
          stats.memory.free = parseInt(atoms[1]);
          stats.memory.used = stats.memory.total - stats.memory.free;

          next();
        }
      );
    },

    function(next) {
      fs.writeFile('./stats.json', JSON.stringify(stats), function() {
        next();
      });
    }
  ],
  function(err) {
  });
}, 1000);