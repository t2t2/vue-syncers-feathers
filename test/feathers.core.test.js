import test from 'ava'
import 'babel-core/register'
import {addVueWithPlugin, vueCleanup} from './helpers/before/vue-hookup'

test.beforeEach(addVueWithPlugin)

test.afterEach(vueCleanup)

test('Throws error if no feathers client set', t => {
	const {Vue} = t.context

	t.throws(() => {
		t.context.instance = new Vue({
			sync: {
				test: 'test',
			},
		})
	}, 'No feathers instance set on driver options')
})
