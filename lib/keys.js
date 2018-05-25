'use strict';

var _ = require('lodash');
var utils = require('./utils');

module.exports = {
  setContext: function (context) {
    this.branch = findBranch(context.job.project.branches, context.branch);
    // If no private key is set on this branch, use the key from master.
    this.branch.privkey = this.branch.privkey || getMasterPrivKey(context.job.project.branches);
  },
  whatIsMyPublicKey: function () {
    var pubKey = this.branch.pubkey;
    if (pubKey)
      return `Your public key on this branch:\n${pubKey}`;
    else
      return 'You do not have a public key on this worker.';
  },
  getPrivateKey: function (optionalKey, callback) {
    if (optionalKey) {
      callback(null, optionalKey);
    } else {
      if (this.branch.privkey) callback(null, this.branch.privkey);
      else callback(new Error('No private key available!'));
    }
  }
};

function findBranch(branches, name) {
  var foundBranch = false;
  branches.some(function (branch) {
    if (branch.name) {
      var regEx = new RegExp(`^${branch.name.replace(/\*/g, '.*')}$`);
      if (regEx.test(name)) {
        foundBranch = branch;
        return true;
      }
    }
  });
  return (function discreteBranchFn(name, branch, branches) {
    if (branch.name !== name) {
      var discreteBranch = _.find(branches, {name: name});
      if (discreteBranch) branch = discreteBranch;
    }
    return branch;
  }(name, foundBranch, branches));
}

function getMasterPrivKey(branches) {
  var master = utils.getMasterBranch(branches);
  return master ? master.privkey : '';
}
