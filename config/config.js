(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

app.controller('SshDeployController', require('./controller'));

},{"./controller":2}],2:[function(require,module,exports){
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

},{"../lib/parse_host_string":3,"../lib/remote_paths":4}],3:[function(require,module,exports){
'use strict';

module.exports = function (str) {
  var min = 1;
  var max = 65535;
  var parts1 = str.split('@');
  var port = null;
  var user = null;
  if (parts1.length != 2){
    return null;
  }
  var hostString = '';
  if (parts1.length == 2){
    user = parts1[0];
    hostString = parts1[1];
  } else {
    hostString = parts1[0];
  }
  var parts2 = hostString.split(':');
  if (parts2.length > 2){
    return null;
  }
  var host = parts2[0];
  if (parts2[1]) {
    port = parseInt(parts2[1]);
    var validPort = port >= min && port <= max;
    if (!validPort) {
      return null;
    }
  } else {
    port = 22;
  }
  return {
    string: `${user}@${host}:${port}`,
    user: user,
    host: host,
    port: port
  };
};

},{}],4:[function(require,module,exports){
'use strict';

module.exports = function (name) {
  var remote = `$HOME/${name}`;
  var randomId = Math.random().toString(36).substring(7);

  return {
    name: name,
    remote: remote,
    old: `${remote}.old`,
    bundle: `/tmp/package-${randomId}.tar.gz`
  };
};

},{}]},{},[1]);
