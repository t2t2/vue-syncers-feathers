import test from 'ava'

import aliasesMixinMaker from '../src/aliases'

import {addVueWithPlugin, vueCleanup} from './helpers/before/vue-hookup'

function makeBaseDriver() {
	return class TestDriver {
		constructor(Vue) {
			Vue.util.defineReactive(this, 'state', {})
			Vue.util.defineReactive(this, 'loading', true)
		}

		ready() {
		}

		destroy() {
		}

		refresh() {
		}
	}
}

test.afterEach(vueCleanup)

test('All aliases', t => {
	let testing = null

	class TestSyncer extends makeBaseDriver() {
		refresh() {
			t.is(testing, 'refresh')
		}
	}

	addVueWithPlugin(t, {
		aliases: true,
		driver: TestSyncer,
		feathers: {
			service(service) {
				t.is(testing, 'service')
				t.is(service, 'manual-test')
			}
		}
	})
	const {Vue} = t.context

	const instance = new Vue({
		sync: {
			test: 'test'
		}
	})

	testing = 'loading'
	t.is(instance.$loading, true)

	testing = 'refresh'
	instance.$refresh()

	testing = 'service'
	instance.$service('manual-test')
})

test('Toggling aliases', t => {
	addVueWithPlugin(t, {
		driver: makeBaseDriver(),
		feathers: {}
	})
	const {Vue} = t.context

	Vue.mixin(aliasesMixinMaker({
		loading: false,
		refresh: true
		// Service: false is implied
	}))

	const instance = new Vue({
		sync: {
			test: 'test'
		}
	})

	t.is(typeof instance.$loading, 'undefined')
	t.is(typeof instance.$refresh, 'function')
	t.is(typeof instance.$service, 'undefined')
})
