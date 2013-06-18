var proxies = module.exports;

proxies.listproxies = function(options, fn) {
  //all proxies
  var path = 'proxies',
    port = options.port && parseInt(options.port) || 0;

  //all proxies for given port
  if (port) {
    path += '/' + port;

    //all proxies for given port & user
    if (options.user && options.user.trim() != '') {
      path += '/' + options.user;

      //all proxies given port, user & app
      if (options.app && options.app.trim() != '')
        path += '/' + options.app;
    }
  }

  this.parent.request(path, function(err, result) {
    if (err)
      return fn(err);

    var header = [],
      msg = [];

    //add port column when showing all proxies
    if (!port)
      header.push('Public port');

    header.push('Domain', 'Host', 'Internal port', 'User', 'App');

    msg.push(header);

    //create proxies message table
    function getProxyMsg(proxies, p) {
      Object.keys(proxies).forEach(function(domain) {
        var row = [];
        if (!port) row.push(p);

        row.push(
          domain,
          proxies[domain].host,
          proxies[domain].port,
          proxies[domain].user,
          proxies[domain].appid
        );

        msg.push(row);
      });
    }

    if (path === 'proxies') {
      //show port when listing all proxies
      Object.keys(result).forEach(function(port) {
        getProxyMsg(result[port], port);
      });
    }else{
      getProxyMsg(result);
    }

    fn(null, {raw: result, message: msg});
  });
};

proxies.startproxy = function() {};
proxies.stopproxy = function() {};
proxies.addroute = function() {};
proxies.deleteroute = function() {};