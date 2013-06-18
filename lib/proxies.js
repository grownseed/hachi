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
          proxies[domain].user || 'x',
          proxies[domain].appid || 'x'
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

proxies._switchProxy = function(path, options, fn) {
  var self = this;

  this.parent.checkRequired(options, ['port'], function(err) {
    if (err)
      return fn(err);

    self.parent.request(path, 'post', fn);
  });
};

proxies.startproxy = function(options, fn) {
  this._switchProxy('proxies/' + parseInt(options.port), options, fn);
};

proxies.stopproxy = function(options, fn) {
  this._switchProxy('proxies/' + parseInt(options.port) + '/delete_proxy', options, fn);
};

proxies.addroute = function(options, fn) {
  var self = this;

  this.parent.checkRequired(options, ['proxy_port', 'port', 'host', 'domain'], function(err) {
    if (err)
      return fn(err);

    var port = parseInt(options.proxy_port);
    delete options.proxy_port;

    self.parent.request('proxies/' + port + '/set', 'post', options, fn);
  });
};

proxies.deleteroute = function(options, fn) {
  var self = this;

  this.parent.checkRequired(options, ['proxy_port', 'port'], function(err) {
    if (err)
      return fn(err);

    var port = parseInt(options.proxy_port);
    delete options.proxy_port;

    self.parent.request('proxies/' + port + '/delete_route', 'post', options, fn);
  });
};