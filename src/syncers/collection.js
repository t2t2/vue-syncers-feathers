import queryMatcher from '../query'
import BaseSyncer from './base'

/**
 * Collection syncer used for multiple items
 */
export default class CollectionSyncer extends BaseSyncer {

	/**
	 * Handle new item creations from feathers
	 *
	 * @param item
	 */
	onItemCreated(item) {
		if (this._itemMatches(item)) {
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
				this.filters.query = newVal

				// Clear state (if now null it just makes sure)
				this.state = this._initialState()

				// Default return nothing
				let returning = false
				if (this.filters.query !== null) {
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
		if ('query' in this.filters) {
			// Do more complex stuff here
			return queryMatcher(item, this.filters.query)
		}
		// No filters
		return true
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
}
