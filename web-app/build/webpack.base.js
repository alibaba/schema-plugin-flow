/* eslint-disable */
const webpack = require('webpack');
const path = require('path'); // node.js自带的路径参数
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');

const APP_PATH = path.resolve(__dirname, '../src');

const extensions = require(path.resolve(__dirname, '../extensions/config.js'));
const { sysExtTypes, customerTyps } = extensions;
const extPath = {};
sysExtTypes.forEach(item => {
  extPath[item.value] = item.path;
});
customerTyps.forEach(item => {
  extPath[item.value] = item.path;
});
console.log('extensions', extensions);
module.exports = {
  entry: {
    app: './app/index.jsx',
    // vendor: ['react', 'react-dom','react-router'],
    ...extPath,
  },
  // externals: {
  //   'react': 'React',
  //   'react-dom': 'ReactDOM',
  //   'react-router': 'ReactRouter',
  // },
  output: {
    // chunkFilename: '[name].[chunkhash].bundle.js',
    publicPath: '/',
  },
  // optimization: {
  //   splitChunks: {
  //     runtimeChunk: 'single',
  //   }
  // },
  resolve: {
    extensions: ['.js', '.jsx', '.css', '.less'],
    modules: [
      path.join(__dirname, '../node_modules'), // submodules version confict： https://github.com/webpack/webpack/issues/6505
    ],
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        // include: path.resolve(__dirname, '../node_modules'),
        use: [
          {
            loader: 'style-loader',
            options: { injectType: 'singletonStyleTag' },
          },
          {
            loader: 'css-loader',
            options: {}
          },
        ],
      },
      {
        test: /\.less$/i,
        use: [
          {
            loader: 'style-loader',
            options: { injectType: 'singletonStyleTag' },
          },
          {
            loader: 'css-loader',
            options: {}
          },
          {
            loader: 'less-loader',
            options: { javascriptEnabled: true }
          }
        ],
      },
      {
        test: /\.js[x]?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  plugins: [
    // 动态库路径配置
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require('./vendor/vendor-manifest.json')
    }),
    new HtmlWebpackPlugin({
      template: 'public/index.html',
      title: 'sfioDemo',
      extConfig: JSON.stringify(extensions),
      chunks: [],
      minify: {
        // removeComments: true,
        // collapseWhitespace: true,
        // removeAttributeQuotes: true
      },
    }),
    // new AddAssetHtmlPlugin({
    //   filepath: path.resolve(__dirname, "../dist/vendor.js")
    // })
  ]
};
