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

var users = module.exports;

users.listusers = function(options, fn) {
  this.parent.request('users', function(err, result) {
    if (err)
      return fn(err);

    var msg = [['Username', 'Admin', 'Last Access']];

    if (result && result.push && result.length > 0) {
      result.forEach(function(user) {
        msg.push([user.username, (user.admin ? 'yes' : 'no').toString(), (user.last_access || 'never')]);
      });
    }

    fn(null, {raw: result, message: msg});
  });
};

users.adduser = function(options, fn) {
  var self = this;

  this.parent.populate(options, ['username', 'password', 'admin'], function(err, options) {
    if (err)
      return fn(err);

    options.admin = (options.admin == 'y');

    self.parent.request('users', 'post', options, function(err, result) {
      if (err)
        return fn(err);

      fn(null, {raw: result, message: 'New user created: ' + result.username + ', ' + result.password});
    });
  });
};

users.login = function(options, fn) {
  var self = this;

  //default to host's user if no user provided
  options.username = options.username || this.parent.host.user;

  this.parent.populate(options, ['username', 'password'], function(err, options) {
    if (err)
      return fn(err);

    self.parent.request('users/login', 'post', options, function(err, result) {
      if (err)
        return fn (err);

      self.parent.host.token = result.token;
      self.parent.host.user = options.username;

      fn(null, {raw: result, message: 'Successfully logged in as ' + options.username});
    });
  });
};

users.logout = function(options, fn) {
  var self = this;

  this.parent.request('users/logout', 'post', function(err, result) {
    if (err)
      return fn(err);

    self.parent.host.token = result.token = false;

    fn(null, {raw: result, message: 'Successfully logged out'});
  });
};

users.updateuser = function(options, fn) {
  var self = this;

  options.username = options.username || self.parent.host.user;

  this.parent.populate(options, ['username', 'password', 'admin'], function(err, options) {
    if (err)
      return fn(err);

    options.admin = (options.admin == 'y');

    var username = options.username;
    delete options.username;

    self.parent.request('users/' + username, 'post', options, function(err, result) {
      if (err)
        return fn(err);

      fn(null, {raw: result, message: result.message});
    });
  });
};