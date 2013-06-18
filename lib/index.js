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

  req.on('error', fn);

  if (params.data) {
    return params.data.pipe(req)
      .on('close', function(){ req.end() });
  }
  else if (Object.keys(params).length > 0) {
    req.write(JSON.stringify(params));
  }

  req.end();
};

//check required fields
hachi.prototype.populate = function(data, fields, fn) {
  var args = data.args || [];

  //return undefined fields
  var required = fields.filter(function(f, i){
    //map args to fields
    if (args[i]) data[f] = args[i];

    return data[f] == undefined;
  });

  if (required.length > 0) {
    fn({required: required});
  }else{
    //remove unspecified fields
    Object.keys(data).forEach(function(k) {
      if (fields.indexOf(k) === -1)
        delete data[k];
    });

    fn(null, data);
  }
};

hachi.prototype.callApi = function(api_module, call, params, fn) {
  this.api[api_module][call](params, fn);
};