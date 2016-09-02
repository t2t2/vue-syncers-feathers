import test from 'ava'

import Vue from 'vue'
import {Service} from 'feathers-memory'

import ItemSyncer from '../src/syncers/item'

import {addFeathersInstance, addBasicService, feathersCleanup} from './helpers/before/feathers-hookup'
import {addVueInstance, vueCleanup} from './helpers/before/vue-hookup'

test.beforeEach(addFeathersInstance)
test.beforeEach(addBasicService)
test.beforeEach(addVueInstance)
test.beforeEach(t => {
	t.context.createSyncer = function (settings) {
		return new ItemSyncer(Vue, t.context.instance, {feathers: t.context.client}, 'test', settings)
	}
})

test.afterEach(t => {
	if ('syncer' in t.context) {
		t.context.syncer.destroy()
	}
})
test.afterEach(feathersCleanup)
test.afterEach(vueCleanup)

test('Get an item', async t => {
	const {instance, createSyncer} = t.context

	instance.$on('syncer-error', (path, error) => {
		t.fail(error)
	})

	const syncer = t.context.syncer = createSyncer({
		service: 'test',
		id: function () {
			return 1
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
	t.deepEqual(syncer.state, {id: 1, tested: true})
})

test('Undefined items set null and send error', async t => {
	const {instance, createSyncer} = t.context

	instance.$on('syncer-loaded', () => {
		t.fail('Loaded something')
	})

	const syncer = t.context.syncer = createSyncer({
		service: 'test',
		id: function () {
			return 3
		}
	})

	t.plan(4)

	instance.$once('syncer-error', (path, error) => {
		t.is(path, 'test')
		t.truthy(error)
	})

	await syncer.ready()

	t.falsy(syncer.loading)
	t.deepEqual(syncer.state, null)
})

test('Switching items', async t => {
	const {instance, createSyncer} = t.context

	instance.$set('variables.itemId', 1)
	instance.$on('syncer-error', (path, error) => {
		t.fail(error)
	})

	const syncer = t.context.syncer = createSyncer({
		service: 'test',
		id: function () {
			return instance.variables.itemId
		}
	})

	t.plan(6)

	await syncer.ready()

	t.falsy(syncer.loading)
	t.deepEqual(syncer.state, {id: 1, tested: true})

	// Test null id (should just clear the target)
	await new Promise(resolve => {
		instance.variables.itemId = null
		Vue.util.nextTick(() => {
			resolve()
		})
	})

	t.falsy(syncer.loading)
	t.is(syncer.state, null)

	// Promiseify next loading
	await new Promise(resolve => {
		instance.$once('syncer-loaded', () => {
			resolve()
		})
		instance.variables.itemId = 2
	})

	t.falsy(syncer.loading)
	t.deepEqual(syncer.state, {id: 2, otherItem: true})
})

/*
 * I mean.... You shouuuuuuldn't..... But you shouldn't intentionally.... Like okay it may happen
 * I'll reserve the right to judge you for doing this. But I'll probably end up doing the same somewhere
 */
test('Creating items', async t => {
	const {service, instance, createSyncer} = t.context

	instance.$on('syncer-loaded', () => {
		t.fail('Loaded something')
	})

	const syncer = t.context.syncer = createSyncer({
		service: 'test',
		id: function () {
			return 3
		}
	})

	t.plan(3)

	// Most of this is already tested in other places
	instance.$once('syncer-error', () => {
		t.pass()
	})
	await syncer.ready()

	t.is(syncer.state, null)

	// Create the item
	const created = await service.create({created: 'Ok'})

	t.deepEqual(syncer.state, created)
})

test('Update item', async t => {
	const {service, instance, createSyncer} = t.context

	instance.$on('syncer-error', (path, error) => {
		t.fail(error)
	})

	const syncer = t.context.syncer = createSyncer({
		service: 'test',
		id: function () {
			return 1
		}
	})

	t.plan(3)

	await syncer.ready()

	t.falsy(syncer.loading)
	t.deepEqual(syncer.state, {id: 1, tested: true})

	await service.update(1, {updated: true})

	t.deepEqual(syncer.state, {id: 1, updated: true})
})

test('Patch item', async t => {
	const {service, instance, createSyncer} = t.context

	instance.$on('syncer-error', (path, error) => {
		t.fail(error)
	})

	const syncer = t.context.syncer = createSyncer({
		service: 'test',
		id: function () {
			return 1
		}
	})

	t.plan(3)

	await syncer.ready()

	t.falsy(syncer.loading)
	t.deepEqual(syncer.state, {id: 1, tested: true})

	await service.patch(1, {updated: true})

	t.deepEqual(syncer.state, {id: 1, tested: true, updated: true})
})

test('Delete item', async t => {
	const {service, instance, createSyncer} = t.context

	instance.$on('syncer-error', (path, error) => {
		t.fail(error)
	})

	const syncer = t.context.syncer = createSyncer({
		service: 'test',
		id: function () {
			return 1
		}
	})

	t.plan(3)

	await syncer.ready()

	t.falsy(syncer.loading)
	t.deepEqual(syncer.state, {id: 1, tested: true})

	await service.remove(1)

	t.deepEqual(syncer.state, null)
})

test('Updates to other items don\'t affect the tracked item', async t => {
	const {service, instance, createSyncer} = t.context

	instance.$on('syncer-error', (path, error) => {
		t.fail(error)
	})

	await service.create([{premade: true}, {anotherPremade: true}])

	const syncer = t.context.syncer = createSyncer({
		service: 'test',
		id: function () {
			return 1
		}
	})

	t.plan(3)

	await syncer.ready()

	t.falsy(syncer.loading)
	t.deepEqual(syncer.state, {id: 1, tested: true})

	await Promise.all([
		service.create({created: true}),
		service.update(2, {updated: true}),
		service.patch(3, {patched: true}),
		service.remove(4)
	])

	t.deepEqual(syncer.state, {id: 1, tested: true})
})

test('Custom id field', async t => {
	const {server, createSyncer} = t.context

	server.service('custom', new Service({
		idField: 'known',
		startId: 2,
		store: {
			1: {
				known: 1,
				id: 99,
				idTest: true
			}
		}
	}))

	const syncer = t.context.syncer = createSyncer({
		service: 'custom',
		id: function () {
			return 1
		},
		idField: 'known'
	})

	t.plan(2)

	await syncer.ready()

	t.falsy(syncer.loading)
	t.deepEqual(syncer.state, {known: 1, id: 99, idTest: true})
})
