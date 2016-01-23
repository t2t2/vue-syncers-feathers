import installHooks from './hooks'
import {baseIgnoredKeys, baseSpecialFilters, createMatcher} from './query'

export default {
	/**
	 * Install to vue
	 *
	 * @function
	 * @param {Vue} Vue - Vue
	 * @param {Object} options - Options
	 * @param {Function} [options.driver] - Custom driver to use
	 * @param {Object} [options.driverOptions] - Options for the driver
	 */
	install: function (Vue, options = {}) {
		Vue.$syncer = options
		installHooks(Vue)
	},

	query: {
		baseIgnoredKeys,
		baseSpecialFilters,
		createMatcher,
	},
}
