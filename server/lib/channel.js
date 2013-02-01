'use strict';

var User = require('./user');

function Channel(name) {
  this._name = name;
  this._users = [];
}

Channel.prototype.isUserJoined = function(user) {
  return this._users.indexOf(user) !== -1;
};

Channel.prototype.join = function(user, callback) {
  if (!this.isUserJoined(user)) {
    var self = this;
    user.on('disconnect', function() {
      self.part(user, function(err) {
      })
    });

    this._users.push(user);
    //this.broadcast({ type: 'join', user: user.name }, callback);
    callback();
  } else {
    return callback(new Error('Unable to join channel "' + this._name + '"'));
  }
};

Channel.prototype.part = function(user, callback) {
  if (this.isUserJoined(user)) {
    this._users.splice(this._users.indexOf(user), 1);
    //this.broadcast({ type: 'part', user: user.name }, callback);
    callback();
  } else {
    return callback(new Error('Unable to part channel "' + this._name + '"'));
  }
};

Channel.prototype.broadcast = function(message, callback) {
  var count = this._users.length;
  if (count === 0) {
    return callback(new Error('No users to broadcast'));
  }

  var payload = JSON.stringify(message);
  this._users.forEach(function(user, index) {
    process.nextTick(function() {
      user.send(payload);
      if (--count === 0) callback();
    });
  });
};

Channel.prototype.stats = function(callback) {
  return callback(null, {
    users: this._users.length
  });
};

module.exports = Channel;