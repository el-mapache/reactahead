var path = require('path');
var webpack = require('webpack');

module.exports = {
  context: __dirname + '/src',

  target: 'web',

  entry: [
    'babel-polyfill',
    './index.js'
  ],

  output: {
    path: __dirname + '/dist',
    filename: 'build.js'
  },

  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader' }
    ]
  },
  resolve: {
    extensions: ['', '.js'],
    modulesDirectories: ['src', 'node_modules']
  },
  externals: [
    {
      react: {
        root: 'React',
        commonjs2: 'react',
        commonjs: 'react'
      }
    }
  ],
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.DefinePlugin({
      global: {},
      window: {}
    })
  ]
};
