import test from 'ava'
import 'babel-core/register'

import Vue from 'vue'
import CollectionSyncer from '../src/syncers/collection'

import {addFeathersInstance, addBasicService, feathersCleanup} from './helpers/before/feathers-hookup'
import {vueCleanup} from './helpers/before/vue-hookup'

test.beforeEach(addFeathersInstance)
test.beforeEach(addBasicService)
test.beforeEach(t => {
	t.context.instance = new Vue({
		data: function () {
			return {
				// To avoid vue-warn for setting paths on vm
				variables: {},
			}
		},
	})

	t.context.createSyncer = function (settings) {
		return new CollectionSyncer(Vue, t.context.instance, {feathers: t.context.client}, 'test', settings)
	}
})

test.afterEach(t => {
	if ('syncer' in t.context) {
		t.context.syncer.destroy()
	}
})
test.afterEach(feathersCleanup)
test.afterEach(vueCleanup)

test('Get filtered collection', async t => {
	const {instance, createSyncer} = t.context

	instance.$on('syncer-error', (path, error) => {
		t.fail(error)
	})

	const syncer = t.context.syncer = createSyncer({
		service: 'test',
		query: function () {
			return {
				otherItem: true,
			}
		},
	})

	t.plan(1)

	await syncer.ready()

	t.same(syncer.state, {2: {id: 2, otherItem: true}})
})

test('No results is just empty and no error', async t => {
	const {instance, createSyncer} = t.context

	instance.$on('syncer-error', (path, error) => {
		t.fail(error)
	})

	const syncer = t.context.syncer = createSyncer({
		service: 'test',
		query: function () {
			return {
				noItems: true,
			}
		},
	})

	t.plan(1)

	await syncer.ready()

	t.same(syncer.state, {})
})

test('Switching queries', async t => {
	const {instance, createSyncer} = t.context

	instance.$set('variables.query', {tested: true})
	instance.$on('syncer-error', (path, error) => {
		t.fail(error)
	})

	const syncer = t.context.syncer = createSyncer({
		service: 'test',
		query: function () {
			return instance.variables.query
		},
	})

	t.plan(6)

	await syncer.ready()

	t.notOk(syncer.loading)
	t.same(syncer.state, {1: {id: 1, tested: true}})

	// Null query: just cleared
	await new Promise(resolve => {
		instance.variables.query = null
		Vue.util.nextTick(() => {
			resolve()
		})
	})

	t.notOk(syncer.loading)
	t.same(syncer.state, {})

	// Change query
	await new Promise(resolve => {
		instance.variables.query = {otherItem: true}
		Vue.util.nextTick(() => {
			resolve()
		})
	})

	t.notOk(syncer.loading)
	t.same(syncer.state, {2: {id: 2, otherItem: true}})
})

test('Creating items', async t => {
	const {instance, service, createSyncer} = t.context

	instance.$on('syncer-error', (path, error) => {
		t.fail(error)
	})

	const syncer = t.context.syncer = createSyncer({
		service: 'test',
		query: function () {
			return {
				tested: true,
			}
		},
	})

	await syncer.ready()

	let should = {1: {id: 1, tested: true}}

	t.same(syncer.state, should)

	// Create item that matches
	const created = await service.create({tested: true, another: 'yep'})

	should[created.id] = created

	t.same(syncer.state, should)

	// Create item that doesn't match (doesn't get added)
	await service.create({otherItem: true, another: 'yep'})

	t.same(syncer.state, should)
})

test('Updating items', async t => {
	const {instance, service, createSyncer} = t.context

	instance.$on('syncer-error', (path, error) => {
		t.fail(error)
	})

	const syncer = t.context.syncer = createSyncer({
		service: 'test',
		query: function () {
			return {
				tested: true,
			}
		},
	})

	await syncer.ready()

	t.same(syncer.state, {1: {id: 1, tested: true}})

	// Update item that matches
	await service.update(1, {id: 1, tested: true, another: 'yep'})

	t.same(syncer.state, {1: {id: 1, tested: true, another: 'yep'}})

	// Update item that doesn't match (is removed)
	await service.update(1, {id: 1, another: 'yep'})

	t.same(syncer.state, {})

	// Update item that didn't match (does nothing)
	await service.update(1, {id: 1, another: 'again'})

	t.same(syncer.state, {})

	// Update item that now matches
	await service.update(2, {id: 2, tested: true, otherItem: true})

	t.same(syncer.state, {2: {id: 2, tested: true, otherItem: true}})
})

test('Patching items', async t => {
	const {instance, service, createSyncer} = t.context

	instance.$on('syncer-error', (path, error) => {
		t.fail(error)
	})

	const syncer = t.context.syncer = createSyncer({
		service: 'test',
		query: function () {
			return {
				tested: true,
			}
		},
	})

	await syncer.ready()

	t.same(syncer.state, {1: {id: 1, tested: true}})

	// Patch item that matches
	await service.patch(1, {another: 'yep'})

	t.same(syncer.state, {1: {id: 1, tested: true, another: 'yep'}})

	// Patch item that doesn't match (is removed)
	await service.patch(1, {tested: false})

	t.same(syncer.state, {})

	// Patch item that didn't match (does nothing)
	await service.patch(1, {tested: 'still not'})

	t.same(syncer.state, {})

	// Patch item that now matches
	await service.patch(2, {tested: true})

	t.same(syncer.state, {2: {id: 2, tested: true, otherItem: true}})
})

test('Removing items', async t => {
	const {instance, service, createSyncer} = t.context

	instance.$on('syncer-error', (path, error) => {
		t.fail(error)
	})

	const syncer = t.context.syncer = createSyncer({
		service: 'test',
		query: function () {
			return {
				tested: true,
			}
		},
	})

	await syncer.ready()

	t.same(syncer.state, {1: {id: 1, tested: true}})

	// Remove item that matches
	await service.remove(1)

	t.same(syncer.state, {})

	// Remove item that doesn't match (does nothing)
	await service.remove(2)

	t.same(syncer.state, {})
})