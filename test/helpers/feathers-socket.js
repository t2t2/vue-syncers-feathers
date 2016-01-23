import {socket as feathersSocketCommons, stripSlashes} from 'feathers-commons'
import {each} from 'feathers-commons/lib/utils'
import {setupEventHandlers, setupMethodHandlers} from 'feathers-commons/lib/sockets/helpers'
import Proto from 'uberproto'
import {Server} from './mock-socket'

/**
 * Mocks a connection between client and server
 *
 * Based on feathers-socketio
 *
 * @param {String} url
 * @returns {Function}
 */
export function localSocketer(url) {
	return function () {
		const app = this

		Proto.mixin({
			service(path, obj) {
				// at the moment of writing the method handlers to existing connections is too buggy
				const app = this
				const protoService = this._super.apply(this, arguments)
				const info = this._commons

				// app._socketInfo will only be available once we are set up
				if (obj && info) {
					const location = stripSlashes(path)

					// Set up event handlers for this new service
					setupEventHandlers.call(app, info, protoService, location)
					// For any existing connection add method handlers
					// FIXED: protoService position
					each(info.clients(), socket =>
						setupMethodHandlers.call(app, info, socket, protoService, location)
					)
				}

				return protoService
			},
			setup() {
				const io = this.io = new Server(url)

				io.on('connection', socket => {
					socket.feathers = {
						provider: 'socketio',
					}
				})

				feathersSocketCommons.setup.call(this, {
					method: 'emit',
					connection() {
						return io
					},
					clients() {
						return io.clients()
					},
					params(socket) {
						return socket.feathers
					},
				})
			},
		}, app)
	}
}
