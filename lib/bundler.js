'use strict';

var fs = require('fs');
var exec = require('child_process').exec;

module.exports = {
  // This is how you would bundle a NODE.JS project...
  // A generic solution would be to use git-archive;
  // See https://github.com/Strider-CD/strider-ssh-deploy/issues/2
  bundleProject: function (dataDir, name, progress, done) {
    var bundlePath = `/tmp/${name}.tar.gz`;
    var progstream = require('progress-stream');
    var progressEmitter = progstream({time: 1000});
    progressEmitter.on('progress', progress);
    require('npmd-pack')(dataDir, {})
      .pipe(progressEmitter)
      .pipe(fs.createWriteStream(bundlePath)).on('finish', function () {
        fs.exists(bundlePath, function (yes) {
          if (yes)
            done(null, bundlePath, true);
          else
            done(new Error('Failed to create project bundle'));
        });
      });
  },
  bundleCustom: function(dataDir, name, customCommand, progress, done) {
    var bundlePath = `/tmp/${name}.tar.gz`;
    var progstream = require('progress-stream');
    var progressEmitter = progstream({time: 1000});
    progressEmitter.on('progress', progress);
    var command = 'cd '.concat(dataDir).concat(' && ').concat(customCommand).concat(' > ').concat(bundlePath);

    exec(command, function(err) {
      if (err) {
        done(new Error('custom command failed '.concat(err)));
      }
      else {
        done(null, bundlePath, false);
      }
    });
  },
  untarCmd: function (bundlePath, extractDir, stripTarFolder) {
    return `tar -zxf ${bundlePath} -C ${extractDir}`.concat(stripTarFolder ? ' --strip-components=1' : '');
  }
};
