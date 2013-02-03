// forever start stats.js

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
var cpu = { time: null };
var collectingConnections = false;

setInterval(function() {
  async.waterfall([
    function(next) {
      if (!collectingConnections) {
        collectingConnections = true;

        exec('netstat -ntu | grep :10000 | awk \'{print $5}\' | cut -d: -f1 | sort | uniq -c | sort -n -r',
          function(err, stdout, stderr) {
            if (stdout.length === 0) {
              collectingConnections = false;
              return next();
            }

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

            next();
          }
        );
      } else {
        next();
      }
    },

    function(next) {
      exec('ps aux | grep server.js | awk \'{print $2, $11, $12}\'',
        function(err, stdout, stderr) {
          var pid = null;
          var lines = stdout.split('\n');

          lines.some(function(line, index) {
            var atoms = line.split(' ');
            if (atoms[1] === '/usr/local/bin/node' && atoms[2] === (process.cwd() + '/server.js')) {
              pid = parseInt(atoms[0]);
              return true;
            }

            return false;
          });

          if (!pid) return next();

          exec('cat /proc/' + pid + '/stat',
            function(err, stdout, stderr) {
              var elems = stdout.toString().split(' ');
              var utime = parseInt(elems[13]);
              var stime = parseInt(elems[14]);
              var ctime = utime + stime;

              if (cpu.time !== null) {;
                var delta = ctime - cpu.time;
                cpu.percentage = delta;
                stats.load = cpu.percentage;
              }

              cpu.time = ctime;
              next();
            }
          );
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
      fs.writeFile('./stats.json', JSON.stringify(stats), function(err) {
        next(err);
      });
    }
  ],
  function(err) {
    //console.log(err);
    //console.log(util.inspect(stats, false, 100));
  });
}, 1000);