'use strict';

var Stats = angular.module('Stats', []);

Stats.filter('round', function() {
  return function(input) {
    return Math.round(input);
  };
});

Stats.controller('StatsController', function($scope, $http, $timeout) {
  $scope.stats = {};

  $scope.update = function() {
    $timeout(function() {
      $http.get('/stats/json').success(function(stats) {
        $scope.stats = stats;
      });
      $scope.update();
    }, 1000);
  };

  $scope.update();
});