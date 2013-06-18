/*
 The MIT License

 Copyright (c) 2013 Hadrien Jouet https://github.com/grownseed

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

var proxies = module.exports;

proxies.listproxies = function(options, fn) {
  var self = this,
    path = 'proxies';

  this.parent.populate(options, ['port', 'user', 'app'], function(err, options) {
    if (err)
      return fn(err);

    var port = options.port && parseInt(options.port) || 0;

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

    self.parent.request(path, function(err, result) {
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
  });

};

proxies._switchProxy = function(path, options, fn) {
  var self = this;

  this.parent.populate(options, ['port'], function(err) {
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

  this.parent.populate(options, ['public_port', 'port', 'host', 'domain'], function(err, options) {
    if (err)
      return fn(err);

    var port = parseInt(options.public_port);
    delete options.public_port;

    self.parent.request('proxies/' + port + '/set', 'post', options, fn);
  });
};

proxies.deleteroute = function(options, fn) {
  var self = this;

  this.parent.populate(options, ['public_port', 'port'], function(err) {
    if (err)
      return fn(err);

    var port = parseInt(options.public_port);
    delete options.public_port;

    self.parent.request('proxies/' + port + '/delete_route', 'post', options, fn);
  });
};