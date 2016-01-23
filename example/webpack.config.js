var path = require('path')
var webpack = require('webpack')

module.exports = {
//	context: path.resolve(__dirname, './'),
	entry: {
		example: ['webpack-hot-middleware/client?reload=true', './example/index.js'],
	},
	output: {
		path: path.normalize(path.resolve(__dirname, './')),
		filename: '[name].build.js',
		publicPath: '/',
	},
	module: {
		loaders: [
			{
				test: /\.vue$/,
				loader: 'vue',
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel',
				query: {
					presets: ['es2015', 'stage-2'],
				},
			},
		],
	},
	plugins: [
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoErrorsPlugin(),
	],
	devtool: 'source-map',
}
