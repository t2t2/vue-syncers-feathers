import Syncer from './syncer'
import {noop, some} from './utils'

/**
 * Set up syncer objects
 *
 * This is done early to allow for use in eg. computed objects
 *
 * @param {Vue} Vue - Vue
 */
function initSyncers(Vue) {
	this._syncers = {}

	const SyncCreator = Vue.$syncer.driver || Syncer
	let synced = this.$options.sync
	if (synced) {
		// Set up each syncer
		Object.keys(synced).forEach((key) => {
			const userDef = synced[key]

			this._syncers[key] = new SyncCreator(Vue, this, Vue.$syncer.driverOptions || {}, key, userDef)

			Object.defineProperty(this, key, {
				get: () => {
					return this._syncers[key] ? this._syncers[key].state : null
				},
				set: noop,
				enumerable: true,
				configurable: true,
			})
		})

		// Add state that tells if all are loaded
		Vue.util.defineReactive(this, '$loadingSyncers', true)

		this.$watch(function () {
			// If any are true
			return some(this._syncers, (syncer) => {
				return 'loading' in syncer ? syncer.loading : false
			})
		}, (newVal) => {
			this.$loadingSyncers = newVal
		}, {sync: true, immediate: true})
	} else {
		// Never will change
		this.$loadingSyncers = false
	}
}

/**
 * Start the syncers
 *
 * This tells the system that it's ok to request data (and to eg. set up watchers)
 */
function startSyncers() {
	Object.keys(this._syncers).forEach((key) => {
		this._syncers[key].ready()
	})
}

/**
 * Cleans up all of the syncers
 */
function cleanupSyncers() {
	Object.keys(this._syncers).forEach((key) => {
		this._syncers[key].destroy()
		delete this._syncers[key]
	})
}

/**
 * Install hooks onto the Vue instance
 *
 * @param {Vue} Vue - Vue
 */
export default function installHooks(Vue) {
	Vue.prototype._initSyncers = initSyncers
	Vue.prototype._startSyncers = startSyncers
	Vue.prototype._cleanupSyncers = cleanupSyncers

	const baseInitState = Vue.prototype._initState
	Vue.prototype._initState = function (...args) {
		this._initSyncers(Vue)
		const result = baseInitState.call(this, ...args)
		this._startSyncers()
		return result
	}

	const baseCleanup = Vue.prototype._cleanup
	Vue.prototype._cleanup = function (...args) {
		if (this._isDestroyed) {
			// I'm not gonna say to satisfy linter, but......
			return baseCleanup.call(this, ...args)
		}
		this._cleanupSyncers()
		return baseCleanup.call(this, ...args)
	}
}
