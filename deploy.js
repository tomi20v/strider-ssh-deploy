var Promise = require('bluebird');
var fs = require('fs');
var _ = require('lodash');
var keys = require('./keys');
var bundler = require('./bundler');
var remotely = require('./remotely')

var parseHostString = require('./parse_host_string');

var getConnectionOptions = function(config, callback) {
  keys.getPrivateKey(config.privateKey, function(err, key) {
    if (err) return callback(err);
    else if (_.isArray(config.hosts) && config.hosts.length > 0) {
      return callback(null, _.map(config.hosts, function(hostString) {
        var parsed = parseHostString(hostString);
        return {
          host: parsed.host,
          port: parsed.port,
          username: config.user,
          privateKey: key
        }
      }));
    } else callback(new Error("Must provide one or more hosts"));
  })
}

module.exports = {
  configure: function(config, done) {
    return function(context, done) {
      keys.setContext(context);
      getConnectionOptions(config, function(err, hosts) {
        if (err) return done(err);
        var projectName = context.job.project.name.replace('/', '_');


        function proceed(scp) {
          var promises = _.map(hosts, function(sshOpts) {
            return remotely.deploy(
              context.out, projectName, config.script, sshOpts, scp
            )
          });
          Promise.all(promises).then(function() {
            done(0);
          }).catch(function(err) {
            done(err);
          })
        }

        if (config.scp) {
          bundler.bundleProject(context.dataDir, projectName, function(tar) {
            context.comment("Compressing ... "+Math.round(tar.percentage)+"%")
          }, function(err, bundlePath) {
            if (err) {
              return done(new Error("Could not create bundle "+bundlePath))
            } else {
              proceed({
                localBundlePath: bundlePath,
                progress: function(sftp) {
                  context.comment("Uploading ... "+Math.round(sftp.percentage)+"%")
                }
              })
            }
          })
        } else {
          proceed()
        }
      })
    }
  }
}
