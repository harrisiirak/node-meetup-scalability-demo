'use strict';

var async = require('async');
var Channel = require('./channel');
var User = require('./user');

function Chat() {
}

Chat._channels = {};

Chat.registerChannel = function(name, options) {
  Chat._channels[name] = new Channel(name,
    options || {
      announcements: false
    }
  );
};

Chat.unregisterChannel = function(name) {
  Chat._channels[name] = null;
};

Chat.findChannel = function(name, callback) {
  if (Chat._channels[name]) {
    return callback(null, Chat._channels[name] || null);
  } else {
    return callback(new Error('Cannot find channel named "' + name + '"'));
  }
};

Chat.listen = function(res, userName, channelName, callback) {
  async.waterfall([
    function(next) {
      User.find(userName, function(err, user) {
        if (!user) {
          user = new User(userName, res);
          next(null, user);
        } else {
          next(new Error('Username is in use'));
        }
      });
    },

    function(user, next) {
      User.register(user, function(err) {
        next(null, user);
      });
    },

    function(user, next) {
      Chat.findChannel(channelName, function(err, channel) {
        if (channel) {
          next(null, user, channel);
        } else {
          next(new Error('Unable to join channel #' + channelName));
        }
      });
    },

    function(user, channel, next) {
      channel.join(user, function(err) {
        next(err);
      });
    }
  ],
  function(err) {
    callback(err);
  });
};

module.exports = Chat;