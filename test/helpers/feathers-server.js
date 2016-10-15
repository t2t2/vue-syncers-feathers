import feathers from 'feathers'
import feathersClient from 'feathers/client'
import feathersSocketIOclient from 'feathers-socketio/client'
import localSocketer from './feathers-socket'
import {SocketIO} from './mock-socket'

function localClient(url) {
	const connection = new SocketIO(url)
	// fool feathers into thinking it's socketio
	connection.io = true

	return feathersSocketIOclient(connection)
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
					client.io.on('connect', () => {
						resolve(client)
					})
					client.io.on('close', error => {
						reject(error)
					})
				})
			}

			return client
		}
	}
}
