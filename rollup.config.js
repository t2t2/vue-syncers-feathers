import babel from 'rollup-plugin-babel'

/*
 if(!process.env.PROD_BUILD_MODE) {
 process.env.PROD_BUILD_MODE = 'commonjs'
 }
 */

const config = {
	entry: __dirname + '/src/index.js',
	format: 'cjs',
	plugins: [babel()],
	dest: __dirname + '/dist/vue-syncers-feathers.common.js',
}

if (process.env.npm_lifecycle_event === 'build:commonjs') {
	// Common.js build
}

export default config