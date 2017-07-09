const path = require('path')
const webpack = require('webpack')

module.exports = {
//	Context: path.resolve(__dirname, './'),
	entry: {
		example: ['webpack-hot-middleware/client?reload=true', './example/index.js']
	},
	output: {
		path: path.normalize(path.resolve(__dirname, './')),
		filename: '[name].build.js',
		publicPath: '/'
	},
	module: {
		rules: [
			{
				test: /\.vue$/,
				use: 'vue-loader'
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: 'babel-loader'
			}
		]
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: '"development"'
			}
		})
	],
	devtool: 'source-map'
}
