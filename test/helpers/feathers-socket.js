import Proto from 'uberproto'
import socket from 'feathers-socket-commons'
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

		app.configure(socket('io'))

		Proto.mixin({
			setup() {
				const io = this.io = new Server(url)

				io.on('connection', socket => {
					socket.feathers = {
						provider: 'socketio',
					}
				})

				this._socketInfo = {
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
				}

				return this._super.apply(this, arguments)
			},
		}, app)
	}
}
