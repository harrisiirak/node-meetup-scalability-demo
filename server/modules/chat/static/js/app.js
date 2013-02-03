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
    var that = this;
    $http.get('/register?user='+ this.username +'&channel=lobby').success(function(data, code) {

      $rootService.setUsername(that.username);
      $location.path('/');

    }).error(function(data, code) {

      $scope.error = data;
    });
  }
}