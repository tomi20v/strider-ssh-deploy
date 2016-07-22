'use strict';

module.exports = {
  init: function (config, job, context, done) {
    done(null, { deploy: require('./lib/deploy').configure(config || {}) });
  }
};
