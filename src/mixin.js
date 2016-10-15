import {noop, some} from './utils'

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
		beforeDestroy: beforeDestroy()
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
			Object.keys(synced).forEach(key => {
				const userDef = synced[key]

				this._syncers[key] = new SyncCreator(Vue, this, key, userDef)

				Object.defineProperty(this, key, {
					get: () => {
						return this._syncers[key] ? this._syncers[key].state : null
					},
					set: noop,
					enumerable: true,
					configurable: true
				})
			})

			// Add state that tells if all are loaded
			Vue.util.defineReactive(this, '$loadingSyncers', true)
			// The watcher for this is in created() as $watch doesn't work this early
		} else {
			// Never will change
			this.$loadingSyncers = false
		}
	}
}

/**
 * After creation hook
 */
function created() {
	return function () {
		// Start syncers
		Object.keys(this._syncers).forEach(key => {
			this._syncers[key].ready()
		})

		if (Object.keys(this._syncers).length > 0) {
			// Watcher for $loadingSyncers
			this.$watch(function () {
				// If any are true
				return some(this._syncers, syncer => {
					return 'loading' in syncer ? syncer.loading : false
				})
			}, newVal => {
				this.$loadingSyncers = newVal
			}, {sync: true, immediate: true})
		}
	}
}

/**
 * Before destruction hook
 */
function beforeDestroy() {
	return function () {
		Object.keys(this._syncers).forEach(key => {
			this._syncers[key].destroy()
			delete this._syncers[key]
		})
	}
}
