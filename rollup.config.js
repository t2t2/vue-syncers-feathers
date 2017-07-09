import path from 'path'
import babel from 'rollup-plugin-babel'

/*
 If(!process.env.PROD_BUILD_MODE) {
 process.env.PROD_BUILD_MODE = 'commonjs'
 }
 */

const config = {
	entry: path.join(__dirname, '/src/index.js'),
	external: [
		'feathers-commons/lib/utils',
		'feathers-query-filters'
	],
	plugins: [
		babel({
			presets: [
				['env', {
					targets: {
						browsers: '> 1%, Last 2 versions, IE 9' // Based on vue's requirements
					},
					modules: false,
					loose: true
				}]
			],
			plugins: [
				'external-helpers'
			],
			babelrc: false
		})
	]
}

if (process.env.npm_lifecycle_event === 'build:commonjs') {
	// Common.js build
	config.format = 'cjs'
	config.dest = path.join(__dirname, '/dist/vue-syncers-feathers.common.js')
} else if (process.env.npm_lifecycle_event === 'build:esm') {
	// Common.js build
	config.format = 'es'
	config.dest = path.join(__dirname, '/dist/vue-syncers-feathers.esm.js')
}

export default config
