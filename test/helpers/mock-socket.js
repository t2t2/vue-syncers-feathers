import {SocketIO as BaseSocketIOConstructor, Server as BaseServer} from 'mock-socket'
import {createMessageEvent} from 'mock-socket/dist/event-factory'
import cloneDeepWith from 'lodash/cloneDeepWith'

export class Server extends BaseServer {
	// SocketIO sends server (this) as first arg to connection & connect events, this fixes it
	dispatchEvent(event, ...customArguments) {
		if (customArguments[0] && customArguments[0] === this) {
			customArguments.shift()
		}
		return super.dispatchEvent(event, ...customArguments)
	}
}

// SocketIO class isn't exposed
let serverInstance = new Server('dummy')
let instance = new BaseSocketIOConstructor('dummy')
const BaseSocketIO = Object.getPrototypeOf(instance).constructor
instance.on('connect', () => {
	instance.close()
	serverInstance.close()
})
// GG

function cloneCustomiser(arg) {
	if (typeof arg === 'function') {
		return function (...args) {
			args = cloneDeepWith(args, cloneCustomiser)
			return arg(...args)
		}
	}
}

export class SocketIO extends BaseSocketIO {

	// Allow more than 1 arg
	emit(event, ...data) {
		if (this.readyState !== BaseSocketIO.OPEN) {
			throw new Error('SocketIO is already in CLOSING or CLOSED state')
		}

		// Emulate connection by re-creating all objects
		data = cloneDeepWith(data, cloneCustomiser)

		const messageEvent = createMessageEvent({
			type: event,
			origin: this.url,
			data,
		})

		// Dispatch on self since the event listeners are added to per connection
		this.dispatchEvent(messageEvent, ...data)
	}

	once(type, callback) {
		const wrapped = (...args) => {
			this.removeEventListener(type, wrapped)
			return callback(...args)
		}
		return this.on(type, wrapped)
	}

	off(...args) {
		this.removeEventListener(...args)
	}
}
