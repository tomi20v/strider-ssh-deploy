'use strict';

var crypto = require('crypto');

module.exports = function (name) {
  var remote = '$HOME/' + name;
  var randomId = crypto.randomBytes(16).toString('hex');

  return {
    name: name,
    remote: remote,
    old: remote + '.old',
    bundle: '/tmp/package-' + randomId + '.tar.gz'
  };
};
