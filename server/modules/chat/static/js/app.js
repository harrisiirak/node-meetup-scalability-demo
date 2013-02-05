'use strict';

var Chat = angular.module('Chat', []).config(function($routeProvider, $locationProvider) {
  $routeProvider.when('/', {
    templateUrl: 'chat/partials/chat',
    controller: ChatController
  })
  .when('/namePick', {
    templateUrl: 'chat/partials/namePick',
    controller: NameController
  })
  .otherwise({
    redirectTo: '/'
  });
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
  
}

function ChatController($scope, $http, $location, $rootService) {

  console.log('here');
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
    var res = { body: null, chunks: [] };
    var req = new XMLHttpRequest();
    req.open('GET', '/register?username='+ this.username +'&channel=lobby', true)

    req.onreadystatechange = function() {
      console.log(req);
      if (req.responseText.length > 0) {
        var chunk = JSON.parse(res.body ?
          req.responseText.substring(res.body.length) : req.responseText);

        res.body = req.responseText;
        res.chunks.push(chunk);

        console.log(chunk);
      }
    };

    req.send();
      
    $rootService.setUsername(this.username);
    $location.path('/');
  }
}