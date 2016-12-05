'use strict';

var webpack = require('webpack');
var webpackUglifyJsPlugin = require('webpack-uglify-js-plugin');

var ENV = process.env.ENV;

module.exports = {
  cache: true,
  entry: ['./src/index.jsx'],
  output: {
    path: 'dist',
    filename: 'bundle.min.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx$/, 
        loader: 'babel', 
        exclude: /(node_modules|bower_components)/
      },
      {
        test: /\.js$/, 
        loader: 'babel', 
        exclude: /(node_modules|bower_components)/
      }
    ]
  },
  plugins: []
};
