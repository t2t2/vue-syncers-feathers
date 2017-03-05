import {looseEqual, pick} from '../utils'
import BaseSyncer from './base'

/**
 * Collection syncer used for multiple items
 */
export default class CollectionSyncer extends BaseSyncer {

	/**
	 * Create a syncer for feathers
	 *
	 * @param Vue
	 * @param vm
	 * @param path
	 * @param settings
	 */
	constructor(Vue, vm, path, settings) {
		super(Vue, vm, path, settings)

		this._matcher = () => true // For without query
		this._createMatcher = Vue.$syncer.matcher
		this._filterParser = Vue.$syncer.filter
	}

	/**
	 * Handle new item creations from feathers
	 *
	 * @param item
	 */
	onItemCreated(item) {
		if (this._itemMatches(item)) {
			item = this._transformPerQuery(item)
			this._set(item[this._id], item)
		}
	}

	/**
	 * Handle item updates from feathers
	 *
	 * @param item
	 */
	onItemUpdated(item) {
		if (this._itemMatches(item)) {
			item = this._transformPerQuery(item)
			this._set(item[this._id], item)
		} else if (item[this._id] in this.state) {
			this._remove(item[this._id])
		}
	}

	/**
	 * Handle item removals from feathers
	 *
	 * @param item
	 */
	onItemRemoved(item) {
		if (item[this._id] in this.state) {
			this._remove(item[this._id])
		}
	}

	/**
	 * Bind watchers for computed values
	 *
	 * @private
	 */
	_bindComputedValues() {
		if ('query' in this.settings) {
			this.filters.query = null

			// When new value is found
			const callback = function (newVal) {
				// Avoid re-querying if it's the same
				if (looseEqual(this.filters.query, newVal)) {
					this.filters.query = newVal
					return
				}

				this.filters.query = newVal
				if (newVal === null) {
					this.filters.queryParsed = null
				} else {
					this.filters.queryParsed = this._filterParser(newVal)
				}

				// Clear state (if query is now null it makes sure everything's reset)
				this.state = this._initialState()
				this._matcher = () => false

				// Default return nothing
				let returning = false
				if (this.filters.query !== null) {
					this._matcher = this._createMatcher(this.filters.query)
					returning = this._loadNewState()
				}

				if ('hook' in callback) {
					callback.hook(returning)
					delete callback.hook
				}
			}

			return new Promise(resolve => {
				callback.hook = resolve

				this.unwatchers.query = this.vm.$watch(this.settings.query, callback.bind(this), {immediate: true})
			})
		}

		return this._loadNewState()
	}

	/**
	 * Initial data for item syncer
	 *
	 * @returns {*}
	 * @private
	 */
	_initialState() {
		return {}
	}

	/**
	 * Checks if item matches what's in collection
	 *
	 * @param item
	 * @returns {boolean}
	 * @private
	 */
	_itemMatches(item) {
		return this._matcher(item)
	}

	/**
	 * Load the requested state
	 *
	 * @returns {Promise.<T>}
	 * @private
	 */
	_loadState() {
		const params = {}

		if (this.filters.query) {
			params.query = this.filters.query
		}

		return this.service.find(params).then(items => {
			if (this.vm === null) {
				// destroy has been called during loading
				return items
			}

			this.state = this._initialState()

			// if the service is paginated
			if (Array.isArray(items) === false && typeof items.data !== 'undefined') {
				items = items.data
			}

			items.forEach(item => {
				this._set(item[this._id], item)
			})
			this._newStateLoaded()

			return items
		}).catch(this._handleStateLoadingError.bind(this))
	}

	/**
	 * Set current item
	 *
	 * @param key
	 * @param item
	 * @private
	 */
	_set(key, item) {
		this.Vue.set(this.state, key, item)
	}

	/**
	 * Remove current item
	 *
	 * @private
	 */
	_remove(key) {
		this.Vue.delete(this.state, key)
	}

	/**
	 * Transform item using current filter's rules
	 *
	 * @param item
	 * @private
	 */
	_transformPerQuery(item) {
		if (this.filters.queryParsed) {
			const filters = this.filters.queryParsed.filters
			if (filters.$select) {
				item = pick(item, ...filters.$select)
			}
		}
		return item
	}
}
