import {each, warn} from '../utils'

export default class BaseFeathersSyncer {

	/**
	 * Create a syncer for feathers
	 *
	 * @param Vue
	 * @param vm
	 * @param path
	 * @param settings
	 */
	constructor(Vue, vm, path, settings) {
		this.Vue = Vue
		this.vm = vm
		this.path = path
		this.settings = settings

		this.filters = {}
		this.unwatchers = {}
		this.events = {
			loaded: settings.loaded,
			error: settings.errored
		}

		Vue.util.defineReactive(this, 'state', this._initialState())
		Vue.util.defineReactive(this, 'loading', true)

		this._id = 'idField' in settings ? settings.idField : Vue.$syncer.idField

		const client = Vue.$syncer.feathers
		this.service = client.service(this.settings.service)
	}

	/**
	 * Cleanup after oneself
	 */
	destroy() {
		each(this.unwatchers, unwatcher => {
			unwatcher()
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
	 * Refresh syncer's value
	 */
	refresh() {
		return this._loadNewState()
	}

	/**
	 * Handle errors loading the state
	 *
	 * @param error
	 * @private
	 */
	_handleStateLoadingError(error) {
		this.loading = false
		this._fireEvent('error', error)
	}

	/**
	 * Register service listener and unlistener
	 *
	 * @param event
	 * @param callback
	 * @private
	 */
	_listenForServiceEvent(event, callback) {
		/* istanbul ignore next */
		if (process.env.NODE_ENV !== 'production') {
			const origCallback = callback
			callback = (...args) => {
				if (this.Vue === null) {
					warn('Removed event listener is being called. Please update feathers-socket-commons package.')
					return
				}

				origCallback(...args)
			}
		}

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
		this._fireEvent('loaded')
	}

	/**
	 * Fire event on both listeners in settings and instance
	 *
	 * @private
	 */
	_fireEvent(event, ...args) {
		if (event in this.events && this.events[event]) {
			this.events[event].apply(this.vm, args)
		}
		this.vm.$emit(`syncer-${event}`, this.path, ...args)
	}
}
