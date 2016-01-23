var feathers = require('feathers')
var bodyParser = require('body-parser')
var memory = require('feathers-memory')

// Add like: 'var' ability to feathers-memory query
require('feathers-memory/lib/utils').specialFilters.$like = function (key, value) {
	value = value.toString().toLowerCase()
	return function (current) {
		return current[key].toString().toLowerCase().indexOf(value) !== -1
	}
}

var app = feathers()

app.configure(feathers.rest())
	.configure(feathers.socketio())
	.use(bodyParser.json())
	.use(bodyParser.urlencoded({extended: true}))

app.service('todos', memory({
	startId: 2,
	store: {
		1: {
			id: 1,
			title: 'Test Todo',
			completed: false,
		},
	},
}))

app.service('countries', memory({
/*	paginate: {
		default: 25,
		max: 50,
	}, */
}))

// Webpack server
var webpack = require('webpack')
var webpackConfig = require('./webpack.config')
var compiler = webpack(webpackConfig)

app.use(require('webpack-dev-middleware')(compiler, {
	publicPath: webpackConfig.output.publicPath,
	noInfo: true,
	stats: {
		colors: true,
	},
}))
app.use(require('webpack-hot-middleware')(compiler))

// Static files
app.use('/', feathers.static(__dirname))

// Seed with data
app.service('countries').create(require('country-data').countries.all)

app.listen(8030, function () {
	console.log('Serving examples on http://localhost:8030')
})