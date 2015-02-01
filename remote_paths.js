module.exports = function(name) {
  var remote = '$HOME/'+name;
  return {
    name: name,
    remote: remote,
    old: remote+'.old',
    bundle: "/tmp/package-"+require('crypto').randomBytes(16).toString('hex')+".tar.gz",
  }
}
