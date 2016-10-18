import {each, noop, some} from './utils'

/**
 * Install mixin onto the Vue instance
 *
 * @param {Vue} Vue - Vue
 */
export default function (Vue) {
	const VueVersion = Number(Vue.version && Vue.version.split('.')[0])
	const initHook = VueVersion && VueVersion > 1 ? 'beforeCreate' : 'init'

	return {
		[initHook]: beforeCreate(Vue),
		created: created(),
		beforeDestroy: beforeDestroy(),
		computed: {
			$loadingSyncers: loadingStateGetter
		},
		methods: {
			$refreshSyncers: refreshSyncers
		}
	}
}

/*
 * Before creation hook
 *
 * @param {Vue} Vue - Vue
 */
function beforeCreate(Vue) {
	return function () {
		this._syncers = {}

		const SyncCreator = Vue.$syncer.driver
		let synced = this.$options.sync
		if (synced) {
			// Set up each syncer
			each(synced, (settings, key) => {
				this._syncers[key] = new SyncCreator(Vue, this, key, settings)

				Object.defineProperty(this, key, {
					get: () => {
						return this._syncers[key] ? this._syncers[key].state : null
					},
					set: noop,
					enumerable: true,
					configurable: true
				})
			})
		}
	}
}

/**
 * After creation hook
 */
function created() {
	return function () {
		// Start syncers
		each(this._syncers, syncer => {
			syncer.ready()
		})
	}
}

/**
 * Before destruction hook
 */
function beforeDestroy() {
	return function () {
		each(this._syncers, (syncer, key) => {
			syncer.destroy()
			delete this._syncers[key]
		})
	}
}

/**
 * Get loading state of the syncers
 *
 * @returns {boolean}
 */
function loadingStateGetter() {
	if (Object.keys(this._syncers).length > 0) {
		return some(this._syncers, syncer => {
			return syncer.loading
		})
	}
	return false
}

/**
 * Refresh syncers state
 *
 * @param {string|string[]} [keys] - Syncers to refresh
 */
function refreshSyncers(keys) {
	if (typeof keys === 'string') {
		keys = [keys]
	}
	if (!keys) {
		keys = Object.keys(this._syncers)
	}
	return Promise.all(keys.map(key => {
		return this._syncers[key].refresh()
	}))
}
