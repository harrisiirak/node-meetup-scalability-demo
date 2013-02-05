'use strict';

var User = require('./user');

function Channel(name, options) {
  this._name = name;
  this._options = options;
  this._users = [];
}

Channel.prototype.isUserJoined = function(user) {
  return this._users.indexOf(user) !== -1;
};

Channel.prototype.join = function(user, callback) {
  if (!this.isUserJoined(user)) {
    var self = this;
    user.on('disconnect', function() {
      self.part(user, function(err) { });
    });

    this._users.push(user);

    if (this._options.announcements) {
      this.broadcast({ type: 'join', user: user._name }, callback);
    } else {
      callback();
    }
  } else {
    return callback(new Error('Unable to join channel "' + this._name + '"'));
  }
};

Channel.prototype.part = function(user, callback) {
  if (this.isUserJoined(user)) {
    this._users.splice(this._users.indexOf(user), 1);

    if (this._options.announcements) {
      this.broadcast({ type: 'part', user: user._name }, callback);
    } else {
      callback();
    }
  } else {
    return callback(new Error('Unable to part channel "' + this._name + '"'));
  }
};

Channel.prototype.broadcast = function(message, callback) {
  var count = this._users.length;
  if (count === 0) {
    return callback(new Error('No users to broadcast'));
  }

  this._users.forEach(function(user, index) {
    process.nextTick(function() {
      user.send(message);
      if (--count === 0) callback();
    });
  });
};

Channel.prototype.users = function(callback) {
  var names = [];
  this._users.forEach(function(user, index) {
    names.push(user._name);
  });

  callback(names);
};

Channel.prototype.stats = function(callback) {
  return callback(null, {
    users: this._users.length
  });
};

module.exports = Channel;