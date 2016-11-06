import filter from 'feathers-query-filters'
import {matcher} from 'feathers-commons/lib/utils'

import aliasesMixinMaker from './aliases'
import Syncer from './syncer'
import syncerMixin from './mixin'

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
