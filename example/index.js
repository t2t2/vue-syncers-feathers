// Feathers client
import feathers from 'feathers/client'
import feathersIO from 'feathers-socketio/client'
import io from 'socket.io-client'
import Vue from 'vue'
import VueSyncersFeathers from '../src'

import App from './app.vue'

const socket = io()
const client = feathers()
client.configure(feathersIO(socket))

// Install vue-syncers-feathers

Vue.use(VueSyncersFeathers, {
	driverOptions: {
		feathers: client
	}
})

// Convenience method to access feathers client in vue instances
Vue.prototype.$feathers = client

// Create instance
global.app = new Vue(App)
