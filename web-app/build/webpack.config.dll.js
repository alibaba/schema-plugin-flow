/* eslint-disable */
const webpack = require("webpack");
const path = require("path");
const DIST_PATH = path.resolve(__dirname, '../dist');
module.exports = {
  context: __dirname,
  entry: {
    vendor: ['react', 'react-dom','react-router','react-router-dom', 'load-js']
  },
  // devtool: "source-map",
  mode: "production",
  output: {
    path: DIST_PATH,
    filename: "[name].js",
    library: "[name]"
  },
  plugins: [
    new webpack.DllPlugin({
      context:__dirname,
      path: path.join(__dirname, "vendor", "[name]-manifest.json"),
      name: "[name]"
    })
  ]
};