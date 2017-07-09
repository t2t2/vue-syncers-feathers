const feathers = require('feathers')
const rest = require('feathers-rest')
const bodyParser = require('body-parser')
const socketio = require('feathers-socketio')
const memory = require('feathers-memory')

// Patch in {like: 'var'} ability to feathers-memory query
require('feathers-commons/lib/utils').specialFilters.$like = function (key, value) {
	value = value.toString().toLowerCase()
	return function (current) {
		return current[key].toString().toLowerCase().indexOf(value) !== -1
	}
}

const app = feathers()

app.configure(rest())
app.configure(socketio())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.service('todos', memory({
	startId: 2,
	store: {
		1: {
			id: 1,
			title: 'Test Todo',
			completed: false
		}
	}
}))

app.service('countries', memory({
/*	Paginate: {
		default: 25,
		max: 50,
	}, */
}))

// Webpack server
const webpack = require('webpack')
const webpackConfig = require('./webpack.config')

const compiler = webpack(webpackConfig)

app.use(require('webpack-dev-middleware')(compiler, {
	publicPath: webpackConfig.output.publicPath,
	noInfo: true,
	stats: {
		colors: true
	}
}))
app.use(require('webpack-hot-middleware')(compiler))

// Static files
app.use('/', feathers.static(__dirname))

// Seed with data
app.service('countries').create(require('country-data').countries.all)

app.listen(8030, () => {
	console.log('Serving examples on http://localhost:8030')
})
