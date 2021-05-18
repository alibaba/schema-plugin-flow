/* eslint-disable */
const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const DIST_PATH = path.resolve(__dirname, '../dist');
const baseWebpackConfig = require('./webpack.base');
module.exports = merge(baseWebpackConfig, {
  mode: 'development',
  devServer: {
    contentBase: DIST_PATH,
    port: 8082,
    host: "127.0.0.1",
    historyApiFallback: true,
    overlay: true,
    open: true,
    hot: true,
  },
  //devtool: 'eval-source-map',
  output: {
    filename: '[name].js',
    path: DIST_PATH
  },
  plugins: [new webpack.HotModuleReplacementPlugin()]
});