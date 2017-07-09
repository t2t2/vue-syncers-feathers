import test from 'ava'

import {Service} from 'feathers-memory'

import ItemSyncer from '../src/syncers/item'

import {addBasicService} from './helpers/before/feathers-hookup'
import {addVueAndFeathers, vueAndFeathersCleanup} from './helpers/before/feathers-and-vue-hookup'

test.beforeEach(addVueAndFeathers)
test.beforeEach(addBasicService)
test.beforeEach(t => {
	const Vue = t.context.Vue
	t.context.instance = new Vue({
		data() {
			return {
				// To avoid vue-warn for setting paths on vm
				variables: {}
			}
		}
	})

	t.context.createSyncer = function (settings) {
		return new ItemSyncer(Vue, t.context.instance, 'test', settings)
	}
})

test.afterEach(t => {
	if ('syncer' in t.context) {
		t.context.syncer.destroy()
	}
})
test.afterEach(vueAndFeathersCleanup)

test('Get an item', async t => {
	const {instance, createSyncer} = t.context

	instance.$on('syncer-error', (path, error) => {
		t.fail(error)
	})

	const syncer = createSyncer({
		service: 'test',
		id() {
			return 1
		}
	})
	t.context.syncer = syncer

	t.plan(4)

	// Loading by default
	t.truthy(syncer.loading)

	instance.$once('syncer-loaded', path => {
		// Correct path
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

	const syncer = createSyncer({
		service: 'test',
		id() {
			return 3
		}
	})
	t.context.syncer = syncer

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
	const {instance, createSyncer, Vue} = t.context

	Vue.set(instance.variables, 'itemId', 1)
	instance.$on('syncer-error', (path, error) => {
		t.fail(error)
	})

	const syncer = createSyncer({
		service: 'test',
		id() {
			return instance.variables.itemId
		}
	})
	t.context.syncer = syncer

	await syncer.ready()

	t.falsy(syncer.loading)
	t.deepEqual(syncer.state, {id: 1, tested: true})

	// Test null id (should just clear the target)
	await new Promise(resolve => {
		instance.variables.itemId = null
		Vue.nextTick(() => {
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
	const {callService, createSyncer, instance} = t.context

	instance.$on('syncer-loaded', () => {
		t.fail('Loaded something')
	})

	const syncer = createSyncer({
		service: 'test',
		id() {
			return 3
		}
	})
	t.context.syncer = syncer

	t.plan(3)

	// Most of this is already tested in other places
	instance.$once('syncer-error', () => {
		t.pass()
	})
	await syncer.ready()

	t.is(syncer.state, null)

	// Create the item
	const created = await callService('create', {created: 'Ok'})

	t.deepEqual(syncer.state, created)
})

test('Update item', async t => {
	const {callService, createSyncer, instance} = t.context

	instance.$on('syncer-error', (path, error) => {
		t.fail(error)
	})

	const syncer = createSyncer({
		service: 'test',
		id() {
			return 1
		}
	})
	t.context.syncer = syncer

	await syncer.ready()

	t.falsy(syncer.loading)
	t.deepEqual(syncer.state, {id: 1, tested: true})

	await callService('update', 1, {updated: true})

	t.deepEqual(syncer.state, {id: 1, updated: true})
})

test('Patch item', async t => {
	const {callService, createSyncer, instance} = t.context

	instance.$on('syncer-error', (path, error) => {
		t.fail(error)
	})

	const syncer = createSyncer({
		service: 'test',
		id() {
			return 1
		}
	})
	t.context.syncer = syncer

	await syncer.ready()

	t.falsy(syncer.loading)
	t.deepEqual(syncer.state, {id: 1, tested: true})

	await callService('patch', 1, {updated: true})

	t.deepEqual(syncer.state, {id: 1, tested: true, updated: true})
})

test('Delete item', async t => {
	const {callService, createSyncer, instance} = t.context

	instance.$on('syncer-error', (path, error) => {
		t.fail(error)
	})

	const syncer = createSyncer({
		service: 'test',
		id() {
			return 1
		}
	})
	t.context.syncer = syncer

	await syncer.ready()

	t.falsy(syncer.loading)
	t.deepEqual(syncer.state, {id: 1, tested: true})

	await callService('remove', 1)

	t.deepEqual(syncer.state, null)
})

test('Updates to other items don\'t affect the tracked item', async t => {
	const {callService, createSyncer, instance, service} = t.context

	instance.$on('syncer-error', (path, error) => {
		t.fail(error)
	})

	await service.create([{premade: true}, {anotherPremade: true}])

	const syncer = createSyncer({
		service: 'test',
		id() {
			return 1
		}
	})
	t.context.syncer = syncer

	await syncer.ready()

	t.falsy(syncer.loading)
	t.deepEqual(syncer.state, {id: 1, tested: true})

	await Promise.all([
		callService('create', {created: true}),
		callService('update', 2, {updated: true}),
		callService('patch', 3, {patched: true}),
		callService('remove', 4)
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

	const syncer = createSyncer({
		service: 'custom',
		id() {
			return 1
		},
		idField: 'known'
	})
	t.context.syncer = syncer

	await syncer.ready()

	t.falsy(syncer.loading)
	t.deepEqual(syncer.state, {known: 1, id: 99, idTest: true})
})

test('Handle destruction while loading', async t => {
	const {createSyncer} = t.context

	const syncer = createSyncer({
		service: 'test',
		id() {
			return 1
		}
	})

	const synced = syncer.ready()
	syncer.destroy()
	await synced

	t.pass()
})
