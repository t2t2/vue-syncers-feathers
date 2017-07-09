import test from 'ava'

import {addVueAndFeathers, vueAndFeathersCleanup} from './helpers/before/feathers-and-vue-hookup'
import {addBasicService} from './helpers/before/feathers-hookup'

test.beforeEach(addVueAndFeathers)
test.beforeEach(addBasicService)

test.afterEach(vueAndFeathersCleanup)

test.cb('Use single item syncer if requested', t => {
	const {Vue} = t.context

	t.context.instance = new Vue({
		sync: {
			testVar: {
				service: 'test',
				id() {
					return 1
				}
			}
		},
		created() {
			this.$on('syncer-loaded', path => {
				t.is(path, 'testVar')
				t.deepEqual(this.testVar, {id: 1, tested: true})
				t.end()
			})
			this.$on('syncer-error', (path, error) => {
				console.error(path, error)
				t.fail(error)
				t.end()
			})
		}
	})
})

test.cb('Cleanup', t => {
	const {client, Vue} = t.context

	const instance = new Vue({
		sync: {
			test: 'test'
		},
		created() {
			this.$on('syncer-loaded', () => {
				Vue.nextTick(() => {
					instance.$destroy()
				})
			})
			this.$on('syncer-error', (path, error) => {
				t.fail(error)
				t.end()
			})
		},
		destroyed() {
			function checkEventListenersAreEmpty(event) {
				if (client.io.listeners['test ' + event]) {
					t.is(client.io.listeners['test ' + event].length, 0)
				} else {
					t.pass()
				}
			}

			checkEventListenersAreEmpty('created')
			checkEventListenersAreEmpty('updated')
			checkEventListenersAreEmpty('patched')
			checkEventListenersAreEmpty('removed')

			// Syncer value is null after deletion
			t.deepEqual(this.test, null)

			t.end()
		}
	})
	t.context.instance = instance
})

test.cb('Synced key can\'t be directly overwritten', t => {
	const {Vue} = t.context

	t.context.instance = new Vue({
		sync: {
			test: 'test'
		},
		created() {
			this.$on('syncer-loaded', () => {
				Vue.nextTick(() => {
					this.test = 'Failed'

					t.not(this.test, 'Failed')

					t.end()
				})
			})
			this.$on('syncer-error', (path, error) => {
				t.fail(error)
				t.end()
			})
		}
	})
})

test.cb('Syncer can be configured in mixins', t => {
	const {Vue} = t.context

	t.context.instance = new Vue({
		mixins: [
			{
				sync: {
					mixedIn: 'test',
					overwritten: {
						service: 'test',
						id() {
							return 2
						}
					}
				}
			}
		],
		sync: {
			overwritten: {
				service: 'test',
				id() {
					return 1
				}
			},
			independant: 'test'
		},
		created() {
			this.$on('syncer-loaded', () => {
				if (this.$loadingSyncers) {
					return // Wait for all
				}

				t.deepEqual(this.mixedIn, {1: {id: 1, tested: true}, 2: {id: 2, otherItem: true}})
				t.deepEqual(this.overwritten, {id: 1, tested: true})
				t.deepEqual(this.independant, {1: {id: 1, tested: true}, 2: {id: 2, otherItem: true}})
				t.end()
			})
			this.$on('syncer-error', (path, error) => {
				t.fail(error)
				t.end()
			})
		}
	})
})

test('Refresh syncers', t => {
	const {service, Vue} = t.context

	// Don't send out events, callService won't work here
	service.filter(() => false)

	let instance

	async function runTests() {
		// Patch all
		await Promise.all([
			service.patch(1, {updated: 1}),
			service.patch(2, {updated: 1})
		])

		// Ensure update didn't get forwarded
		t.deepEqual(instance.testCol, {1: {id: 1, tested: true}, 2: {id: 2, otherItem: true}})
		t.deepEqual(instance.testVar, {id: 1, tested: true})

		// Update one
		await instance.$refreshSyncers('testCol')
		t.deepEqual(instance.testCol, {1: {id: 1, tested: true, updated: 1}, 2: {id: 2, otherItem: true, updated: 1}})
		t.deepEqual(instance.testVar, {id: 1, tested: true})

		// Update array
		await Promise.all([
			service.patch(1, {updated: 2}),
			service.patch(2, {updated: 2})
		])
		await instance.$refreshSyncers(['testCol', 'testVar'])
		t.deepEqual(instance.testCol, {1: {id: 1, tested: true, updated: 2}, 2: {id: 2, otherItem: true, updated: 2}})
		t.deepEqual(instance.testVar, {id: 1, tested: true, updated: 2})

		// Update all
		await Promise.all([
			service.patch(1, {updated: 3}),
			service.patch(2, {updated: 3})
		])
		await instance.$refreshSyncers()
		t.deepEqual(instance.testCol, {1: {id: 1, tested: true, updated: 3}, 2: {id: 2, otherItem: true, updated: 3}})
		t.deepEqual(instance.testVar, {id: 1, tested: true, updated: 3})
	}

	return new Promise((resolve, reject) => {
		instance = new Vue({
			sync: {
				testCol: {
					service: 'test'
				},
				testVar: {
					service: 'test',
					id() {
						return 1
					}
				}
			},
			created() {
				const loaded = () => {
					if (this.$loadingSyncers) {
						return // Wait for all
					}

					this.$off('syncer-loaded', loaded)
					resolve(runTests())
				}

				this.$on('syncer-loaded', loaded)
				this.$on('syncer-error', (path, error) => {
					console.error(path, error)
					reject(error)
				})
			}
		})
		t.context.instance = instance
	})
})

test.cb('Events can be registerred on syncer settings', t => {
	const {Vue} = t.context

	t.plan(4)

	const instance = new Vue({
		sync: {
			passing: {
				service: 'test',
				id() {
					return 1
				},
				loaded() {
					t.deepEqual(instance.passing, {id: 1, tested: true})
					t.is(this, instance)
				},
				errored(err) {
					t.fail(err)
				}
			},
			failing: {
				service: 'test',
				id() {
					return 10
				},
				loaded() {
					t.fail()
				},
				errored(err) {
					t.pass(err)
					t.is(this, instance)
				}
			}
		},
		created() {
			const handleLoaded = () => {
				if (this.$loadingSyncers) {
					return // Wait for all
				}

				this.$nextTick(() => {
					t.end()
				})
			}

			this.$on('syncer-loaded', handleLoaded)
			this.$on('syncer-error', handleLoaded)
		}
	})
	t.context.instance = instance
})

