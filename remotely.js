var fs = require('fs');
var Client = require('ssh2').Client;
var Promise = require('bluebird');
var progress = require('progress-stream');
var bundler = require('./bundler');

function devnull(str) { return str+' > /dev/null 2>&1' };
function prepare(paths) {
  return [
    devnull('rm -rf '+paths.old),
    devnull('mv '+paths.remote+' '+paths.old),
    devnull('mkdir '+paths.remote),
    devnull(bundler.untarCmd(paths.bundle, paths.remote)),
    '\n' // keep this newline so you can simply concat more onto this output
  ].join('\n')
}

function runScript(conn, script, out, done) {
  conn.exec(script, function(err, stream) {
    if (err) throw err;
    stream
    .on('exit', done)
    .on('close', function() {
      conn.end();
    })
    .on('data', function(data) {
      out(data.toString());
    })
    .stderr.on('data', function (data) {
      out(data.toString());
    });
  });
}

module.exports = {
  deploy: function(out, projectName, script, connectOptions, scp) {
    var prefix = 'Host '+connectOptions.host+':'+connectOptions.port+' -- ';
    var paths = require('./remote_paths')(projectName);
    return new Promise(function(resolve, reject) {
      if (! connectOptions.username)
        return reject(new Error('Please set a user in the config!'));
      var conn = new Client();
      var exitCode = -1;
      conn.on('ready', function() {
        if (scp) {
          conn.sftp(function (err, sftp) {
            if (err) throw err;
            var writeStream = sftp.createWriteStream(paths.bundle);
            var str = progress({time:1000, length: fs.statSync(scp.localBundlePath).size});
            str.on('progress', scp.progress);
            fs.createReadStream(scp.localBundlePath).pipe(str)
            .pipe(writeStream)
            .on('close', function() {
              runScript(conn, prepare(paths).concat(script), out, function(_exitCode) {
                exitCode = _exitCode;
              });
            })
          });
        } else {
          runScript(conn, script, out, function(_exitCode) {
            exitCode = _exitCode;
          });
        }
      }).on('error', function(err) {
        if ( /Authentication failure/.test(err.message) ) {
          reject(new Error(prefix+'Public key is not authorized.\nCheck your key on the Branch tab.'))
        } else
          reject(new Error(prefix+err.name+': '+err.message));
      }).on('close', function(hadError) {
        if (hadError)
          reject(new Error(prefix+'Remote connection had errors.')); // should have rejected already
        else if (exitCode !== 0)
          reject(new Error(prefix+'Remote script exited non-zero '+exitCode));
        else
          resolve();
      }).connect(connectOptions);
    })
  }
};
