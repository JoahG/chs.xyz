'use strict';

var webpack = require('webpack');
var config = require('./base.js');
var webpackUglifyJsPlugin = require('webpack-uglify-js-plugin');

config.cache = false;

config.plugins.push(
  new webpack.optimize.UglifyJsPlugin({
    compress: {
        warnings: false
    },
    comments: false
  })
);

config.plugins.push(
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': `'production'`
  })
);

module.exports = config;
