import feathers from 'feathers'
import feathersClient from 'feathers-client'
import {Service as FeathersClientService} from 'feathers-client/lib/sockets/base'
import {localSocketer} from './feathers-socket'
import {SocketIO} from './mock-socket'

function localClient(url) {
	const connection = new SocketIO(url)
	// fool feathers into thinking it's socketio
	connection.io = true

	return function () {
		const client = this

		client.Service = FeathersClientService
		client.connection = connection
	}
}

let instance = 8901

export default function () {
	const server = feathers()
	const url = 'http://localtest:' + instance++

	server.configure(localSocketer(url))

	// Services can be bound late

	// Manually call server setup method
	server.setup()

	return {
		server,
		getClient: (awaiting = true) => {
			const client = feathersClient().configure(localClient(url))
			if (awaiting) {
				return new Promise((resolve, reject) => {
					client.connection.on('connect', () => {
						resolve(client)
					})
					client.connection.on('close', (error) => {
						reject(error)
					})
				})
			}

			return client
		},
	}
}
