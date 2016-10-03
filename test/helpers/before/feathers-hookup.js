import {Service} from 'feathers-memory'
import cloneDeep from 'lodash/cloneDeep'
import feathersTestServer from '../feathers-server'

export async function addFeathersInstance(t) {
	// Feathers
	const {server, getClient} = feathersTestServer()

	t.context.server = server
	t.context.getClient = getClient
	t.context.client = await getClient()
}

const methodToEvent = {
	create: 'created',
	update: 'updated',
	patch: 'patched',
	remove: 'removed'
}

export function addBasicService(t) {
	t.context.server.service('test', new Service({
		startId: 3,
		store: cloneDeep({
			1: {
				id: 1,
				tested: true
			},
			2: {
				id: 2,
				otherItem: true
			}
		})
	}))
	t.context.service = t.context.server.service('test')
	// Call service and don't resolve until clients have been notified
	t.context.callService = (method, ...params) => {
		const eventPromise = new Promise((resolve, reject) => {
			const event = methodToEvent[method]
			if (!event) {
				return resolve()
			}

			const failedTimeout = setTimeout(() => {
				reject(new Error('Waiting for event timed out'))
			}, 5000)
			t.context.client.service('test').once(event, () => {
				clearTimeout(failedTimeout)
				resolve()
			})
		})

		return Promise.resolve(t.context.service[method](...params))
			.then(result => {
				return eventPromise.then(() => result)
			})
	}
}

export function feathersCleanup(t) {
	t.context.server.io.close()
}
