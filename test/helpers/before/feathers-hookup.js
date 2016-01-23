import feathersTestServer from '../feathers-server'
import {Service} from 'feathers-memory'
import cloneDeep from 'lodash/cloneDeep'

export async function addFeathersInstance(t) {
	// Feathers
	const {server, getClient} = feathersTestServer()

	t.context.server = server
	t.context.getClient = getClient
	t.context.client = await getClient()
}

export function addBasicService(t) {
	t.context.server.service('test', new Service({
		startId: 3,
		store: cloneDeep({
			1: {
				id: 1,
				tested: true,
			},
			2: {
				id: 2,
				otherItem: true,
			},
		}),
	}))
	t.context.service = t.context.server.service('test')
}

export function feathersCleanup(t) {
	t.context.server.io.close()
}
