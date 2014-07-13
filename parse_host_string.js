module.exports = function (str) {
  var min = 1;
  var max = 65535;
  var parts = str.split(':');
  var host = parts[0];
  var port = null;
  if (parts.length > 2)
    return null;
  if (parts[1]) {
    port = parseInt(parts[1]);
    var validPort = port >= min && port <= max;
    if (!validPort) {
      return null;
    }
  } else {
    port = 22;
  }
  return {
    string: host+':'+port,
    host: host,
    port: port
  }
};
