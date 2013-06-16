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

  this.parent.checkRequired(options, ['username'], function(err) {
    if (err)
      return fn(err);

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

  this.parent.checkRequired(options, ['username', 'password'], function(err) {
    if (err)
      return fn(err);

    self.parent.request('users/login', 'post', options, function(err, result) {
      if (err)
        return fn (err);

      self.parent.host.token = result.token;

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

  this.parent.checkRequired(options, ['username', 'admin'], function(err) {
    if (err)
      return fn(err);

    options.admin = (options.admin == 'y');

    self.parent.request('users/' + options.username, 'post', options, function(err, result) {
      if (err)
        return fn(err);

      fn(null, {raw: result, message: result.message});
    });
  });
};