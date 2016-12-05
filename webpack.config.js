'use strict';

var ENV = process.env.NODE_ENV;

if (ENV) {
  console.log('Building ' + ENV.toLowerCase() + ' bundle.');
  module.exports = require('./config/' + ENV.toLowerCase() + '.js');
} else {
  module.exports = require('./config/development.js');
}
