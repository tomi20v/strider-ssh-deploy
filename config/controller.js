'use strict';

var parseHostString = require('../lib/parse_host_string');

module.exports = ['$scope', function ($scope) {
  var projectName = $scope.$parent.$parent.project.name;
  $scope.paths = require('../lib/remote_paths')(projectName.replace('/', '_'));
  $scope.$watch('configs[branch.name].ssh_deploy_custom.config', function (value) {
    $scope.config = value;
  });

  $scope.saving = false;
  $scope.save = function () {
    $scope.saving = true;
    $scope.pluginConfig('ssh_deploy_custom', $scope.config, function () {
      $scope.saving = false;
    });
  };

  $scope.removeHost = function (index) {
    $scope.config.hosts.splice(index, 1);
    $scope.save();
  };

  $scope.addHost = function () {
    if (!$scope.config.hosts) $scope.config.hosts = [];
    var host = parseHostString($scope.new_host);
    if (host) {
      $scope.config.hosts.push(host.string);
      $scope.new_host = '';
      $scope.save();
    }
  };
}];
