var fs = require('fs');
var path = require('path');
var format = require('util').format;

var configFile = path.join(process.cwd(), 'app/config', format('/config.%s.js', process.env.NODE_ENV));

if (fs.existsSync(configFile)) {
  module.exports = require(configFile);
}
