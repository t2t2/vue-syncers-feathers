// Feathers client
import feathers from 'feathers/client'
import feathersIO from 'feathers-socketio/client'
import io from 'socket.io-client'

const socket = io()
const client = feathers()
client.configure(feathersIO(socket))

import Vue from 'vue'

// Install vue-syncers-feathers
import VueSyncersFeathers from '../src'

Vue.use(VueSyncersFeathers, {
	driverOptions: {
		feathers: client,
	},
})

// Convenience method to access feathers client in vue instances
Vue.prototype.$feathers = client

// Create instance
import App from './app.vue'
global.app = new Vue(App)
