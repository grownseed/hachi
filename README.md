# hachi

API client and command line tool for [Ishiki](https://github.com/grownseed/haibu-ishiki)

## Install

```bash
npm install hachi
```

Usage:
```javascript
var Hachi = require('hachi'),
  hachi = new Hachi({target: '127.0.0.1', port: '8080'});

hachi.api.users.login({username: 'user', password: 'password'}, function() {
	console.log('Successfully logged in');
});

//...
```

Or to install globally (preferred):

```bash
npm install -g hachi
```

Usage:
```bash
hachi
```

## Help

Run `hachi` (or `hachi --help`) for all commands and options.

## License

[MIT License](https://github.com/grownseed/hachi/blob/master/LICENSE)