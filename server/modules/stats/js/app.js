'use strict';

var Stats = angular.module('Stats', []);

Stats.filter('round', function() {
  return function(input) {
    return Math.round(input);
  };
});

Stats.factory('meters', function() {
  return {
    cpu: new ResourceMeter('.meter-cpu', 140, 200),
    ram: new ResourceMeter('.meter-ram', 140, 200)
  }
});

Stats.controller('StatsController', function($scope, $http, $timeout, meters) {
  $scope.stats = {};

  $scope.update = function() {
    $timeout(function() {
      $http.get('/stats/json').success(function(stats) {
        meters.cpu.update(stats.load / 100, stats.load);
        meters.ram.update(stats.memory.used / stats.memory.total, Math.round(stats.memory.used / 1024));

        $scope.stats = stats;
      });

      $scope.update();
    }, 1000);
  };

  $scope.update();
});