// Run mock-socket-src thorugh babel
const path = require('path')

require('babel-register')({
	ignore: /node_modules(?!\/mock-socket\/src)/,
	extends: path.resolve(__dirname, '../../.babelrc')
})

