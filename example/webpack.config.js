var path = require('path')
var webpack = require('webpack')

module.exports = {
//	context: path.resolve(__dirname, './'),
	entry: {
		example: ['webpack-hot-middleware/client?reload=true', './example/index.js']
	},
	output: {
		path: path.normalize(path.resolve(__dirname, './')),
		filename: '[name].build.js',
		publicPath: '/'
	},
	module: {
		loaders: [
			{
				test: /\.vue$/,
				loader: 'vue'
			},
			{ // Needed for feathers/client
				test: /\.json$/,
				loader: 'json'
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel',
				query: {
					presets: ['latest'],
					plugins: ['transform-runtime']
				}
			}
		]
	},
	plugins: [
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoErrorsPlugin(),
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: '"development"'
			}
		})
	],
	devtool: 'source-map'
}
