import test from 'ava'

import CollectionSyncer from '../src/syncers/collection'

import {addPaginatedService} from './helpers/before/feathers-hookup'
import {addVueAndFeathers, vueAndFeathersCleanup} from './helpers/before/feathers-and-vue-hookup'

test.beforeEach(addVueAndFeathers)
test.beforeEach(addPaginatedService)
test.beforeEach(t => {
	const Vue = t.context.Vue
	t.context.instance = new Vue({
		data: function () {
			return {
				// To avoid vue-warn for setting paths on vm
				variables: {}
			}
		}
	})

	t.context.createSyncer = function (settings) {
		return new CollectionSyncer(Vue, t.context.instance, 'test', settings)
	}
})

test.afterEach(t => {
	if ('syncer' in t.context) {
		t.context.syncer.destroy()
	}
})
test.afterEach(vueAndFeathersCleanup)

test('Basic handling of pagination', async t => {
	const {instance, createSyncer} = t.context

	instance.$on('syncer-error', (path, error) => {
		t.fail(error)
	})

	const syncer = t.context.syncer = createSyncer({
		service: 'paginated',
		query() {
			return {
				$limit: 3
			}
		}
	})

	t.plan(4)

	// Loading by default
	t.truthy(syncer.loading)

	instance.$once('syncer-loaded', path => {
		// correct path
		t.is(path, 'test')
	})

	await syncer.ready()

	t.falsy(syncer.loading)
	t.deepEqual(syncer.state, {1: {id: 1, item: 'first'}, 2: {id: 2, item: 'second'}, 3: {id: 3, item: 'third'}})
})
