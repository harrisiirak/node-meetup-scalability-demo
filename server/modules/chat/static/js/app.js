'use strict';

var Chat = angular.module('Chat', []).config(function($routeProvider, $locationProvider) {
  $routeProvider.when('/', {
    templateUrl: 'chat/partials/chat'
  })
  .when('/namePick', {
    templateUrl: 'chat/partials/namePick',
    controller: NameController
  })
  .otherwise({
    redirectTo: '/'
  });
}).directive('scrollIf', function () {
  return function (scope, element, attributes) {
    setTimeout(function () {
      if (scope.$eval(attributes.scrollIf)) {
        document.getElementById('#chat').scrollTop = 999999;
      }
    });
  }
});

Chat.factory('$rootService', function() {
  var username = null;
  return {
    getUsername: function() {
      return username;
    },
    setUsername: function(name) {
      username = name;
      return;
    }
  }
});

function MainController($scope, $http, $location) {
  $scope.chat = [];
  $scope.users = [];

  $scope.addToChat = function(chunk) {
    // we're using $scope.$apply here so the view would instantly refresh
    $scope.$apply(function() {
        $scope.chat.push(chunk);
    });
  }

  $scope.editUsers = function(users) {
    $scope.$apply(function() {
        $scope.users = users;
    });
  }
}

function ChatController($scope, $http, $location, $rootService) {
  console.log('Welcome to chat');

  // current user name
  var username = $rootService.getUsername();

  if(username == null && $location.path() != '/namePick') {
    $location.path('/namePick');
  }

  $scope.sendMsg = function() {
    $http.post('/send', {type: 'msg', channel: 'lobby', from: username, content: this.msg}).success(function(data) {});
    this.msg = '';
  }
}

function NameController($scope, $http, $location, $rootService) {
  $scope.setUsername = function() {
    $scope.error = null;
    var that = this;
    var res = { body: null, chunks: [] };
    var req = new XMLHttpRequest();
    req.open('GET', '/register?user='+ this.username +'&channel=lobby', true)

    req.onreadystatechange = function() {
      console.log(req);
      // status 409? Some kind of an error, get the error
      if(req.status == 409) {
        $scope.$apply(function() {
          $scope.error = req.responseText;
        })
      }


      // readyState 2 means that we have a successful connection up and running, set username and DO IIIT
      if(req.readyState == 2 && req.status == 200) {
        $rootService.setUsername(that.username);

        $scope.$apply(function() {
          $location.path('/');
        })
      }      

      if (req.responseText.length > 0) {
        var chunk = JSON.parse(res.body ?
          req.responseText.substring(res.body.length) : req.responseText);

        res.body = req.responseText;
        res.chunks.push(chunk);

        var shownTypes = ['msg', 'join', 'part']

        if(shownTypes.indexOf(chunk[chunk.length-1].type) != -1)
          $scope.addToChat(chunk[chunk.length-1]);

        if(chunk[chunk.length-1].type == 'join') {
          // we're using timeout here because launching that function will end up in $digest already running error ($http runs it
          $http.get('/users/lobby').success(function(data) {
            setTimeout(function() {$scope.editUsers(data);}, 200)
          });
        }

        if(chunk[chunk.length-1].type == 'part') {
          // we're using timeout here because launching that function will end up in $digest already running error ($http runs it
          $http.get('/users/lobby').success(function(data) {
            setTimeout(function() {$scope.editUsers(data);}, 200)
          });
        }

      }
    };

    req.send();
  }
}