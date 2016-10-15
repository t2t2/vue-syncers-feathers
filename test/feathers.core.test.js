import test from 'ava'
import {addVueWithPlugin, vueCleanup} from './helpers/before/vue-hookup'

test.afterEach(vueCleanup)

test('Throws error if no feathers client set', t => {
	t.throws(() => {
		addVueWithPlugin(t)
	}, 'No feathers instance set in options')
})
