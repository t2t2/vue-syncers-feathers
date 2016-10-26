import test from 'ava'

import CollectionSyncer from '../src/syncers/collection'

import {addBasicService} from './helpers/before/feathers-hookup'
import {addVueAndFeathers, vueAndFeathersCleanup} from './helpers/before/feathers-and-vue-hookup'

test.beforeEach(addVueAndFeathers)
test.beforeEach(addBasicService)
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

test('Get filtered collection', async t => {
	const {createSyncer, instance} = t.context

	instance.$on('syncer-error', (path, error) => {
		t.fail(error)
	})

	const syncer = t.context.syncer = createSyncer({
		service: 'test',
		query: function () {
			return {
				otherItem: true
			}
		}
	})

	await syncer.ready()

	t.deepEqual(syncer.state, {2: {id: 2, otherItem: true}})
})

test('No results is just empty and no error', async t => {
	const {createSyncer, instance} = t.context

	instance.$on('syncer-error', (path, error) => {
		t.fail(error)
	})

	const syncer = t.context.syncer = createSyncer({
		service: 'test',
		query: function () {
			return {
				noItems: true
			}
		}
	})

	await syncer.ready()

	t.deepEqual(syncer.state, {})
})

test('Switching queries', async t => {
	const {callService, createSyncer, instance, Vue} = t.context

	Vue.set(instance.variables, 'query', {tested: true})
	instance.$on('syncer-error', (path, error) => {
		t.fail(error)
	})

	const syncer = t.context.syncer = createSyncer({
		service: 'test',
		query: function () {
			return instance.variables.query
		}
	})

	await syncer.ready()

	t.falsy(syncer.loading)
	t.deepEqual(syncer.state, {1: {id: 1, tested: true}})

	// Null query: just cleared
	await new Promise(resolve => {
		instance.variables.query = null
		Vue.util.nextTick(() => {
			resolve()
		})
	})

	t.falsy(syncer.loading)
	t.deepEqual(syncer.state, {})

	// Ensure that updates don't get reflected
	await callService('patch', 1, {another: 'yep'})

	t.deepEqual(syncer.state, {})

	// Change query
	await new Promise(resolve => {
		instance.$once('syncer-loaded', () => {
			resolve()
		})
		instance.variables.query = {otherItem: true}
	})

	t.falsy(syncer.loading)
	t.deepEqual(syncer.state, {2: {id: 2, otherItem: true}})

	// Try to avoid re-querying whenver possible
	instance.$once('syncer-loaded', () => {
		t.fail('Queried again when test shouldn\'t')
	})
	instance.variables.query = {otherItem: true}
	// Wait for watchers to do their thing
	await new Promise(resolve => {
		instance.$nextTick(() => {
			resolve()
		})
	})
	t.false(syncer.loading)
})

test('Creating items', async t => {
	const {callService, createSyncer, instance} = t.context

	instance.$on('syncer-error', (path, error) => {
		t.fail(error)
	})

	const syncer = t.context.syncer = createSyncer({
		service: 'test',
		query: function () {
			return {
				tested: true
			}
		}
	})

	await syncer.ready()

	let should = {1: {id: 1, tested: true}}

	t.deepEqual(syncer.state, should)

	// Create item that matches
	const created = await callService('create', {tested: true, another: 'yep'})
	should[created.id] = created

	t.deepEqual(syncer.state, should)

	// Create item that doesn't match (doesn't get added)
	await callService('create', {otherItem: true, another: 'yep'})

	t.deepEqual(syncer.state, should)
})

test('Updating items', async t => {
	const {callService, createSyncer, instance} = t.context

	instance.$on('syncer-error', (path, error) => {
		t.fail(error)
	})

	const syncer = t.context.syncer = createSyncer({
		service: 'test',
		query: function () {
			return {
				tested: true
			}
		}
	})

	await syncer.ready()

	t.deepEqual(syncer.state, {1: {id: 1, tested: true}})

	// Update item that matches
	await callService('update', 1, {id: 1, tested: true, another: 'yep'})

	t.deepEqual(syncer.state, {1: {id: 1, tested: true, another: 'yep'}})

	// Update item that doesn't match (is removed)
	await callService('update', 1, {id: 1, another: 'yep'})

	t.deepEqual(syncer.state, {})

	// Update item that didn't match (does nothing)
	await callService('update', 1, {id: 1, another: 'again'})

	t.deepEqual(syncer.state, {})

	// Update item that now matches
	await callService('update', 2, {id: 2, tested: true, otherItem: true})

	t.deepEqual(syncer.state, {2: {id: 2, tested: true, otherItem: true}})
})

test('Patching items', async t => {
	const {callService, createSyncer, instance} = t.context

	instance.$on('syncer-error', (path, error) => {
		t.fail(error)
	})

	const syncer = t.context.syncer = createSyncer({
		service: 'test',
		query: function () {
			return {
				tested: true
			}
		}
	})

	await syncer.ready()

	t.deepEqual(syncer.state, {1: {id: 1, tested: true}})

	// Patch item that matches
	await callService('patch', 1, {another: 'yep'})

	t.deepEqual(syncer.state, {1: {id: 1, tested: true, another: 'yep'}})

	// Patch item that doesn't match (is removed)
	await callService('patch', 1, {tested: false})

	t.deepEqual(syncer.state, {})

	// Patch item that didn't match (does nothing)
	await callService('patch', 1, {tested: 'still not'})

	t.deepEqual(syncer.state, {})

	// Patch item that now matches
	await callService('patch', 2, {tested: true})

	t.deepEqual(syncer.state, {2: {id: 2, tested: true, otherItem: true}})
})

test('Removing items', async t => {
	const {callService, createSyncer, instance} = t.context

	instance.$on('syncer-error', (path, error) => {
		t.fail(error)
	})

	const syncer = t.context.syncer = createSyncer({
		service: 'test',
		query: function () {
			return {
				tested: true
			}
		}
	})

	await syncer.ready()

	t.deepEqual(syncer.state, {1: {id: 1, tested: true}})

	// Remove item that matches
	await callService('remove', 1)

	t.deepEqual(syncer.state, {})

	// Remove item that doesn't match (does nothing)
	await callService('remove', 2)

	t.deepEqual(syncer.state, {})
})
