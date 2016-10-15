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

test('Get basic collection', async t => {
	const {instance, createSyncer} = t.context

	instance.$on('syncer-error', (path, error) => {
		t.fail(error)
	})

	const syncer = t.context.syncer = createSyncer({
		service: 'test'
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
	const {callService, createSyncer, instance} = t.context

	instance.$on('syncer-error', (path, error) => {
		t.fail(error)
	})

	const syncer = t.context.syncer = createSyncer({
		service: 'test'
	})

	await syncer.ready()
	await callService('create', {created: true})

	t.deepEqual(syncer.state, {1: {id: 1, tested: true}, 2: {id: 2, otherItem: true}, 3: {id: 3, created: true}})
})

test('Current items are updated on the instance', async t => {
	const {callService, createSyncer, instance} = t.context

	instance.$on('syncer-error', (path, error) => {
		t.fail(error)
	})

	const syncer = t.context.syncer = createSyncer({
		service: 'test'
	})

	await syncer.ready()
	await callService('update', 1, {id: 1, updated: true})

	t.deepEqual(syncer.state, {1: {id: 1, updated: true}, 2: {id: 2, otherItem: true}})
})

test('Current items are patched on the instance', async t => {
	const {callService, createSyncer, instance} = t.context

	instance.$on('syncer-error', (path, error) => {
		t.fail(error)
	})

	const syncer = t.context.syncer = createSyncer({
		service: 'test'
	})

	await syncer.ready()
	await callService('patch', 1, {id: 1, updated: true})

	t.deepEqual(syncer.state, {1: {id: 1, tested: true, updated: true}, 2: {id: 2, otherItem: true}})
})

test('Deleted things are removed on the instance', async t => {
	const {callService, instance, createSyncer} = t.context

	instance.$on('syncer-error', (path, error) => {
		t.fail(error)
	})

	const syncer = t.context.syncer = createSyncer({
		service: 'test'
	})

	await syncer.ready()
	await callService('remove', 1)

	t.deepEqual(syncer.state, {2: {id: 2, otherItem: true}})
})

test('Handle destruction while loading', async t => {
	const {createSyncer} = t.context

	const syncer = createSyncer({
		service: 'test'
	})

	const synced = syncer.ready()
	syncer.destroy()
	await synced
})

