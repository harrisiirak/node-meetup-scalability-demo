'use strict';

var events = require('events');
var util = require('util');

function User(name, connection) {
  this._name = name;
  this._connection = connection;
  this._sending = false;
  this._queue = [];

  var self = this;

  this._connection.on('close', function() {
    User._users[self._name] = null;
    clearInterval(self._queueTimer);

    self.emit('disconnect');
  });

  this._queueTimer = setInterval(function() {
    self._flushQueue();
  }, 500);
}

util.inherits(User, events.EventEmitter);

User._queueLimit = 10;
User._users = {};

User.find = function(userName, callback) {
  if (User._users[userName]) {
    return callback(null, User._users[userName]);
  } else {
    return callback(new Error('Unable to find user "' + userName + '"'));
  }
};

User.register = function(user, callback) {
  User._users[user._name] = user;
  callback();
};

User.prototype._flushQueue = function() {
  if (!this._sending && this._queue.length > 0) {
    this._sending = true;

    this._connection.write(JSON.stringify(this._queue));
    this._queue = [];

    this._sending = false;
  }
};

User.prototype.send = function(message) {
  this._queue.push(message);

  if (this._queue.length >= User._queueLimit) {
    this._flushQueue();
  }
};

module.exports = User;