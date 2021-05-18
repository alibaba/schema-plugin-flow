/* eslint-disable */
const path = require('path');
const { merge } = require('webpack-merge'); //合并配置
const DIST_PATH = path.resolve(__dirname, '../dist'); //生产目录
const baseWebpackConfig = require('./webpack.base');
module.exports = merge(baseWebpackConfig, {
	mode: 'production',
	output: {
		filename: '[name].js',
		path: DIST_PATH
	},
	plugins: [
	]
});