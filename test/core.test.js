import test from 'ava'
import {addVueWithPlugin, vueCleanup} from './helpers/before/vue-hookup'

function makeBaseDriver() {
	return class TestDriver {
		constructor(Vue) {
			Vue.util.defineReactive(this, 'state', {})
		}

		ready() {
		}

		destroy() {
		}
	}
}

test.beforeEach(t => {
	addVueWithPlugin(t, {driver: makeBaseDriver(), feathers: {}})
})

test.afterEach(vueCleanup)

test.cb('Syncer lifecycle methods are called in right order', t => {
	const Vue = t.context.Vue

	t.plan(7)
	let order = 0

	class TestSyncer extends makeBaseDriver() {
		constructor(Vue) {
			super(Vue)

			t.is(order++, 0, 'Syncer instance set up')
		}

		ready() {
			super.ready()

			t.is(order++, 2, 'Syncer can be ready')
		}

		destroy() {
			super.destroy()

			t.is(order++, 4, 'Syncer being destroyed')
		}
	}

	Vue.$syncer.driver = TestSyncer

	const instance = new Vue({
		beforeCreate: function () {
			t.is(order++, 1, 'Vue instance created')
		},

		created: function () {
			// no ready in node mode
			t.is(order++, 3, 'Vue instance is ready')

			Vue.nextTick(function () {
				instance.$destroy()
			})
		},

		beforeDestroy: function () {
			t.is(order++, 5, 'Vue instance being destroyed')
		},

		destroyed: function () {
			t.is(order++, 6, 'Vue instance is destroyed')

			Vue.nextTick(function () {
				// Make sure hook doesn't cause double cleanup for any weird reason
				instance.$destroy()

				Vue.nextTick(function () {
					t.end()
				})
			})
		},

		sync: {
			test: 'test'
		}
	})
})

test.cb('Non-used instances work fine', t => {
	const Vue = t.context.Vue

	t.truthy(Vue.$syncer)

	const instance = new Vue({
		destroyed: function () {
			t.pass()

			Vue.nextTick(function () {
				t.end()
			})
		}
	})
	// No syncers = not loading
	t.falsy(instance.$loadingSyncers)
	instance.$destroy()
})
