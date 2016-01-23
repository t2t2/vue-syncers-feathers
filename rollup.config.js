import babel from 'rollup-plugin-babel'
import path from 'path'

/*
 if(!process.env.PROD_BUILD_MODE) {
 process.env.PROD_BUILD_MODE = 'commonjs'
 }
 */

const config = {
	entry: path.join(__dirname, '/src/index.js'),
	format: 'cjs',
	plugins: [babel({
		presets: ['es2015-rollup'],
		babelrc: false,
	})],
	dest: path.join(__dirname, '/dist/vue-syncers-feathers.common.js'),
}

if (process.env.npm_lifecycle_event === 'build:commonjs') {
	// Common.js build
}

export default config
