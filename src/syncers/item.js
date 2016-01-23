import BaseSyncer from './base'

/**
 * Item syncer used for when there's no constraints
 */
export default class ItemSyncer extends BaseSyncer {

	/**
	 * Handle new item creations from feathers
	 *
	 * @param item
	 */
	onItemCreated(item) {
		if (item[this._id] === this.filters.id) {
			this._set(item)
		}
	}

	/**
	 * Handle item updates from feathers
	 *
	 * @param item
	 */
	onItemUpdated(item) {
		if (item[this._id] === this.filters.id) {
			this._set(item)
		}
	}

	/**
	 * Handle item removals from feathers
	 *
	 * @param item
	 */
	onItemRemoved(item) {
		if (item[this._id] === this.filters.id) {
			this._remove()
		}
	}

	/**
	 * Bind watchers for computed values
	 *
	 * @private
	 */
	_bindComputedValues() {
		this.filters.id = null

		// When new value is found
		function callback(newVal) {
			if (typeof newVal === 'string' && /^\d+$/.test(newVal)) {
				// id is int like, but string
				this.filters.id = parseInt(newVal, 10)
			} else {
				this.filters.id = newVal
			}

			// Clear state (if now null it just makes sure)
			this.state = this._initialState()

			// Default return nothing
			let returning = false
			if (this.filters.id !== null) {
				returning = this._loadNewState()
			}

			if ('hook' in callback) {
				callback.hook(returning)
				delete callback.hook
			}
		}

		return new Promise((resolve) => {
			callback.hook = resolve

			this.unwatchers.id = this.vm.$watch(this.settings.id, callback.bind(this), {immediate: true})
		})
	}

	/**
	 * Initial data for item syncer
	 *
	 * @returns {*}
	 * @private
	 */
	_initialState() {
		return null
	}

	/**
	 * Load the requested state
	 *
	 * @returns {Promise.<T>}
	 * @private
	 */
	_loadState() {
		return this.service.get(this.filters.id).then(item => {
			this._set(item)
			this._newStateLoaded()

			return item
		}).catch(this._handleStateLoadingError.bind(this))
	}

	/**
	 * Set current item
	 *
	 * @param item
	 * @private
	 */
	_set(item) {
		this.Vue.set(this, 'state', item)
	}

	/**
	 * Remove current item
	 *
	 * @private
	 */
	_remove() {
		this.state = this._initialState()
	}
}
