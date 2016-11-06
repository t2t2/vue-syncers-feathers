import filter from 'feathers-query-filters'
import {matcher} from 'feathers-commons/lib/utils'

import aliasesMixinMaker from './aliases'
import Syncer from './syncer'
import syncerMixin from './mixin'
import {warn} from './utils'

const defaults = {
	aliases: false,
	driver: Syncer,
	filter,
	idField: 'id',
	matcher
}

export default {
	/**
	 * Install to vue
	 *
	 * @function
	 * @param {Vue} Vue - Vue
	 * @param {Object} options - Options
	 * @param {Function} [options.aliases] - Aliases to enable
	 * @param {Function} [options.driver] - Custom driver to use
	 * @param {Function} [options.filter] - Query filter parser
	 * @param {Object} [options.feathers] - Feathers client
	 * @param {string} [options.idField] - Default ID field
	 * @param {Function} [options.matcher] - Matcher creator
	 */
	install: function (Vue, options = {}) {
		const extend = Vue.util.extend
		// Deprecation Warning: 0.3
		// Deprecate: 0.4
		/* istanbul ignore next */
		if (options.driverOptions && options.driverOptions.feathers) {
			if (process.env.NODE_ENV !== 'production') {
				warn('Deprecation warning: driverOptions.feathers to be deprecated in favor of just feathers')
			}
			options.feathers = options.driverOptions.feathers
		}
		// Vue 2.0 has util.toObject, but 1.0 doesn't
		options = extend(extend({}, defaults), options)

		if (!('feathers' in options)) {
			throw new Error('No feathers instance set in options')
		}

		Vue.$syncer = options
		Vue.prototype.$feathers = options.feathers

		Vue.mixin(syncerMixin(Vue))
		// Mixin handling
		Vue.config.optionMergeStrategies.sync = Vue.config.optionMergeStrategies.props

		if (options.aliases) {
			Vue.mixin(aliasesMixinMaker(options.aliases))
		}
	}
}
