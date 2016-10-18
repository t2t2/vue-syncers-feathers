import path from 'path'
import babel from 'rollup-plugin-babel'

/*
 if(!process.env.PROD_BUILD_MODE) {
 process.env.PROD_BUILD_MODE = 'commonjs'
 }
 */

const config = {
	entry: path.join(__dirname, '/src/index.js'),
	external: [
		'feathers-commons/lib/utils'
	],
	format: 'cjs',
	plugins: [
		babel({
			presets: [
				[
					'latest',
					{
						es2015: {
							modules: false
						}
					}
				]
			],
			plugins: [
				'external-helpers'
			],
			babelrc: false
		})
	],
	dest: path.join(__dirname, '/dist/vue-syncers-feathers.common.js')
}

if (process.env.npm_lifecycle_event === 'build:commonjs') {
	// Common.js build
}

export default config
