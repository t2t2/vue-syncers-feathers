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
				id: function () {
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
				t.fail(error)
				t.end()
			})
		}
	})
})

test.cb('Cleanup', t => {
	const {client, Vue} = t.context

	const instance = t.context.instance = new Vue({
		sync: {
			test: 'test'
		},
		created() {
			this.$on('syncer-loaded', () => {
				Vue.util.nextTick(() => {
					instance.$destroy()
				})
			})
			this.$on('syncer-error', (path, error) => {
				t.fail(error)
				t.end()
			})
		},
		destroyed: function () {
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

			// syncer value is null after deletion
			t.deepEqual(this.test, null)

			t.end()
		}
	})
})

test.cb('Synced key can\'t be directly overwritten', t => {
	const {Vue} = t.context

	t.context.instance = new Vue({
		sync: {
			test: 'test'
		},
		created() {
			this.$on('syncer-loaded', () => {
				Vue.util.nextTick(() => {
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

