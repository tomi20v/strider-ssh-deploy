'use strict';

module.exports = function (name) {
  var remote = '$HOME/' + name;
  var randomId = Math.random().toString(36).substring(7);

  return {
    name: name,
    remote: remote,
    old: remote + '.old',
    bundle: '/tmp/package-' + randomId + '.tar.gz'
  };
};
