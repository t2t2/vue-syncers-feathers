import syncerMixin from './mixin'
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
		Vue.mixin(syncerMixin(Vue))
		// Mixin handling
		Vue.config.optionMergeStrategies.sync = Vue.config.optionMergeStrategies.props
	},

	query: {
		baseIgnoredKeys,
		baseSpecialFilters,
		createMatcher
	}
}
