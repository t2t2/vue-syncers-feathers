export default class BaseFeathersSyncer {

	/**
	 * Create a syncer for feathers
	 *
	 * @param Vue
	 * @param vm
	 * @param driverOptions
	 * @param path
	 * @param settings
	 */
	constructor(Vue, vm, driverOptions, path, settings) {
		if (!('feathers' in driverOptions)) {
			throw new Error('No feathers instance set on driver options')
		}

		this.Vue = Vue
		this.vm = vm
		this.path = path
		this.settings = settings

		this.filters = {}
		this.unwatchers = {}

		Vue.util.defineReactive(this, 'state', this._initialState())
		Vue.util.defineReactive(this, 'loading', true)

		this._id = 'idField' in settings ? settings.idField : 'id'

		const client = driverOptions.feathers
		this.service = client.service(this.settings.service)
	}

	/**
	 * Cleanup after oneself
	 */
	destroy() {
		Object.keys(this.unwatchers).forEach((key) => {
			this.unwatchers[key]()
		})

		this.state = this._initialState()
		this.vm = this.settings = this.Vue = this.service = null
	}

	/**
	 * Hook into feathers and set up value observers
	 *
	 * @returns {*}
	 */
	ready() {
		this._listenForServiceEvent('created', this.onItemCreated.bind(this))
		this._listenForServiceEvent('updated', this.onItemUpdated.bind(this))
		this._listenForServiceEvent('patched', this.onItemUpdated.bind(this))
		this._listenForServiceEvent('removed', this.onItemRemoved.bind(this))

		return this._bindComputedValues()
	}

	/**
	 * Handle errors loading the state
	 *
	 * @param error
	 * @private
	 */
	_handleStateLoadingError(error) {
		this.loading = false
		this.vm.$emit('syncer-error', this.path, error)

		throw error
	}

	/**
	 * Register service listener and unlistener
	 *
	 * @param event
	 * @param callback
	 * @private
	 */
	_listenForServiceEvent(event, callback) {
		this.service.on(event, callback)
		this.unwatchers['service-' + event] = () => {
			this.service.off(event, callback)
		}
	}

	/**
	 * Wrapper for loading current state
	 *
	 * @returns {Promise.<T>}
	 * @private
	 */
	_loadNewState() {
		this.loading = true
		return this._loadState()
	}

	/**
	 * Mark as everything's now loaded
	 *
	 * @private
	 */
	_newStateLoaded() {
		this.loading = false
		this.vm.$emit('syncer-loaded', this.path)
	}

}
