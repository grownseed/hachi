var drones = module.exports;

drones.listdrones = function(options, fn) {
  var path = 'drones';

  if (options.user && options.user.trim() != '') {
    path += '/' + options.user;

    if (options.app && options.app.trim() != '')
      path += '/' + options.app;
  }

  this.parent.request(path, function(err, result) {
    if (err)
      return fn(err);

    var msg = [['User', 'Name', 'Internal Address', 'Domains', 'Started']];

    if (result && result.drones && result.drones.push) {
      result.drones.forEach(function(d) {
        var domains = [];

        ['domain', 'domains', 'subdomain', 'subdomains'].forEach(function(key) {
          if (d[key]) {
            if (typeof d[key] === 'string')
              d[key] = d[key].split(' ');

            d[key].forEach(function(domain) {
              if (domain)
                domains.push(domain);
            });
          }
        });

        msg.push([
          d.user,
          d.name,
          d.host + ':' + (d.env && d.env.PORT || '#'),
          domains.join('\n'),
          (d.started ? 'yes' : 'no')
        ]);
      });
    }

    fn(null, {raw: result, message: msg});
  });
};

drones.deploy = function() {};
drones.start = function() {};
drones.stop = function() {};
drones.restart = function() {};
drones.logs = function() {};