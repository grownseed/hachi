//var querystring = require('querystring');

var hachi = module.exports = function(host) {
  var self = this;

  this.host = host;

  //load api modules
  this.api = {};
  ['users', 'drones', 'proxies'].forEach(function(m) {
    self.api[m] = require('./' + m);
    self.api[m].parent = self;
  });
};

//request Ishiki API
hachi.prototype.request = function(path, method, params, fn) {
  fn = fn || params || method;
  params = (typeof params === 'object' ? params : {});
  method = (typeof method === 'string' ? method : 'get');

  var protocol = require(this.host.secure ? 'https' : 'http');

  var options = {
    host: this.host.target,
    port: this.host.port,
    path: '/' + path + (this.host.token && path !== 'users/login' ? '?token=' + this.host.token : ''),
    method: method.toUpperCase(),
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (this.host.secure) {
    options.rejectUnauthorized = false;
    options.requestCert = true;
    options.agent = false;
  }

  var req = protocol.request(options, function(res) {
    body = '';

    res.on('data', function(chunk) {
      body += chunk;
    });

    res.on('end', function() {
      if (res.headers && res.headers['content-type'] && res.headers['content-type'] == 'application/json')
        body = JSON.parse(body);

      if (res.statusCode == 200)
        fn(null, body);
      else
        fn(body);
    });
  });

  if (Object.keys(params).length > 0) {
    req.write(JSON.stringify(params));
  }

  req.on('error', fn);
  req.end();
};

//check required fields
hachi.prototype.checkRequired = function(data, fields, fn) {
  var required = fields.filter(function(f){ return data[f] == undefined });

  if (required.length > 0)
    fn({required: required});
  else
    fn();
};

hachi.prototype.callApi = function(api_module, call, params, fn) {
  this.api[api_module][call](params, fn);
};