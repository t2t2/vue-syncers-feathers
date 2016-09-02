import test from 'ava'
import 'babel-register'

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

test('Get basic collection', async t => {
	const {instance, createSyncer} = t.context

	instance.$on('syncer-error', (path, error) => {
		t.fail(error)
	})

	const syncer = t.context.syncer = createSyncer({
		service: 'test',
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
	t.deepEqual(syncer.state, {1: {id: 1, tested: true}, 2: {id: 2, otherItem: true}})
})

test('New items are added to the instance', async t => {
	const {instance, service, createSyncer} = t.context

	instance.$on('syncer-error', (path, error) => {
		t.fail(error)
	})

	const syncer = t.context.syncer = createSyncer({
		service: 'test',
	})

	await syncer.ready()

	await service.create({created: true})

	t.deepEqual(syncer.state, {1: {id: 1, tested: true}, 2: {id: 2, otherItem: true}, 3: {id: 3, created: true}})
})

test('Current items are updated on the instance', async t => {
	const {instance, service, createSyncer} = t.context

	instance.$on('syncer-error', (path, error) => {
		t.fail(error)
	})

	const syncer = t.context.syncer = createSyncer({
		service: 'test',
	})

	await syncer.ready()

	await service.update(1, {id: 1, updated: true})

	t.deepEqual(syncer.state, {1: {id: 1, updated: true}, 2: {id: 2, otherItem: true}})
})

test('Current items are patched on the instance', async t => {
	const {instance, service, createSyncer} = t.context

	instance.$on('syncer-error', (path, error) => {
		t.fail(error)
	})

	const syncer = t.context.syncer = createSyncer({
		service: 'test',
	})

	await syncer.ready()

	await service.patch(1, {id: 1, updated: true})

	t.deepEqual(syncer.state, {1: {id: 1, tested: true, updated: true}, 2: {id: 2, otherItem: true}})
})

test('Deleted things are removed on the instance', async t => {
	const {instance, service, createSyncer} = t.context

	instance.$on('syncer-error', (path, error) => {
		t.fail(error)
	})

	const syncer = t.context.syncer = createSyncer({
		service: 'test',
	})

	await syncer.ready()

	await service.remove(1)

	t.deepEqual(syncer.state, {2: {id: 2, otherItem: true}})
})
