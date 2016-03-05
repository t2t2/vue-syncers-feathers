import test from 'ava'
import 'babel-register'
import {addFeathersInstance, feathersCleanup} from './helpers/before/feathers-hookup'
import {Service} from 'feathers-memory'

test.beforeEach(addFeathersInstance)

test.afterEach(feathersCleanup)

function defaultItem() {
	return {
		id: 1,
		tested: true,
	}
}

function testService() {
	return new Service({
		startId: 2,
		store: {
			1: defaultItem(),
		},
	})
}

test('Test the feathers testing server', async t => {
	const {server, client} = t.context

	server.service('test', testService())

	// Getting items
	const item = await client.service('test').get(1)

	t.same(item, {id: 1, tested: true})

	// Events emitted
	await new Promise((resolve, reject) => {
		let result

		function matches(value) {
			// First call sets, second tests
			if (result) {
				t.same(result, value)
			} else {
				result = value
			}
		}

		client.service('test').on('created', (item) => {
			matches(item)

			resolve()
		})

		client.service('test').create({
			tested: 'Ok',
		}).then(item => {
			matches(item)
		}).catch(error => {
			t.fail(error)
			reject()
		})
	})
})
