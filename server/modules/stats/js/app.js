'use strict';

var Stats = angular.module('Stats', []);

Stats.filter('round', function() {
  return function(input) {
    return Math.round(input);
  };
});

Stats.controller('StatsController', function($scope, $http) {
  $scope.stats = {};

  $http.get('/stats/json').success(function(stats) {
    $scope.stats = stats;
  });
});