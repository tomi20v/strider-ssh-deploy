var _ = require('lodash');

module.exports = {
  getMasterBranch: getMasterBranch
};

/**
 * Given an array of branch configurations, returns the branch configuration that relates to the master branch.
 * @param {Array<Object>} branches The branch configurations.
 * @returns {Object|null} The configuration for the master branch, or null if the master branch doesn't exist.
 */
function getMasterBranch(branches) {
  return _.find(branches, function (branch) {
    return branch.name === 'master';
  });
}
