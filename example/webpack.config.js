var path = require('path');
var webpack = require('webpack');

module.exports = {
  context: __dirname,

  target: 'web',

  entry: [
    'babel-polyfill',
    './bootstrap.js'
  ],

  output: {
    path: __dirname + '/build',
    filename: 'build.js'
  },

  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader' }
    ]
  },

  resolve: {
    extensions: ['', '.js'],
    alias: {
      'pokemon': path.join(__dirname + '/data'),
      'typeahead': path.join(__dirname, '..', 'src')
    }
  },

  plugins: [
    //new webpack.optimize.UglifyJsPlugin({minimize: true}),
    new webpack.optimize.OccurenceOrderPlugin()
  ]
};
