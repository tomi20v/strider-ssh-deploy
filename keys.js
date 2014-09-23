var path = require('path')
  , home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE
  , fs = require('fs')
  , _ = require('lodash')


module.exports = {
  setContext: function(context) {
    this.branch = findBranch(context.job.project.branches, context.branch);
  },
  whatIsMyPublicKey: function() {
    var pubKey = this.branch.pubkey
    if (pubKey)
      return "Your public key on this branch:\n"+pubKey;
    else
      return "You do not have a public key on this worker. Expected "+pubKeyPath+" to exist";
  },
  getPrivateKey: function(optionalKey, callback) {
    if (optionalKey) { callback(null, optionalKey) } else {
      if (this.branch.privkey) callback(null, this.branch.privkey);
      else callback(new Error("No private key available!"));
    }
  }
}

function findBranch(branches, name) {
  var foundBranch = false
  branches.some(function (branch) {
    if (branch.name) {
      var regEx = new RegExp('^' + branch.name.replace(/\*/g, '.*') + '$')
      if (regEx.test(name)) {
        foundBranch = branch
        return true
      }
    }
  })
  return (function discreteBranchFn(name, branch, branches) {
    if (branch.name !== name) {
      var discreteBranch = _.findWhere(branches, { name: name });
      if (discreteBranch) branch = discreteBranch;
    }
    return branch;
  }(name, foundBranch, branches))
}
