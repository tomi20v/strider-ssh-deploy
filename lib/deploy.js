'use strict';

var _ = require('lodash');
var bundler = require('./bundler');
var ejs = require('ejs');
var keys = require('./keys');
var parseHostString = require('./parse_host_string');
var Promise = require('bluebird');
var remotely = require('./remotely');
var utils = require('./utils');

function getConnectionOptions(config, callback) {
  keys.getPrivateKey(config.privateKey, function (err, key) {
    if (err) return callback(err);
    else if (_.isArray(config.hosts) && config.hosts.length > 0) {
      return callback(null, _.map(config.hosts, function (hostString) {
        var parsed = parseHostString(hostString);
        if (!parsed) {
          return callback(new Error('The host string could not be parsed. Make sure to provide the host in the format user@hostname:port'));
        }
        return {
          host: parsed.host,
          port: parsed.port,
          username: parsed.user,
          privateKey: key
        };
      }));
    } else callback(new Error('Must provide one or more hosts'));
  });
}

/**
 * Given a job context, determines which hosts to deploy to.
 * @param {Object} context The job context.
 * @returns {Array<String>|Array} An array of host strings.
 */
function getHosts(context) {
  var master = utils.getMasterBranch(context.job.project.branches);
  return master ? master.hosts : [];
}

function compileScript(job, shellScript) {
  var compiled = ejs.compile(shellScript, 'utf-8');
  var compiledScript = compiled(job);

  return compiledScript;
}

module.exports = {
  configure: function (config) {
    return function (context, done) {
      keys.setContext(context);

      // Determine which hosts to deploy to.
      config.hosts = config.hosts || getHosts(context);

      getConnectionOptions(config, function (err, hosts) {
        if (err) return done(err);
        var projectName = context.job.project.name.replace('/', '_');
        var shellScript = compileScript(context.job, config.script);

        function proceed(scp) {
          var promises = _.map(hosts, function (sshOpts) {
            return remotely.deploy(
              context.out, projectName, shellScript, sshOpts, scp
            );
          });
          Promise.all(promises).then(function () {
            done(0);
          }).catch(function (err) {
            done(err);
          });
        }

        function cb(err, bundlePath, stripTarFolder) {
          if (err) {
            return done(new Error(`Could not create bundle ${bundlePath}` + ' / ' + err));
          } else {
            proceed({
              localBundlePath: bundlePath,
              stripTarFolder: stripTarFolder,
              progress: function (sftp) {
                context.comment(`Uploading ... ${Math.round(sftp.percentage)}%`);
              }
            });
          }
        }

        if (config.scp === 'pack') {
          bundler.bundleProject(
            context.dataDir,
            projectName,
            function (tar) {
              context.comment(`Compressing ... ${Math.round(tar.percentage)}%`);
            },
            cb
          );
        } else if (config.scp === 'custom') {
          bundler.bundleCustom(
            context.dataDir,
            projectName,
            config.customcommand,
            function () {
              context.comment('Compressing ... ??? %');
            },
            cb
          );
        } else {
          proceed();
        }
      });
    };
  }
};
