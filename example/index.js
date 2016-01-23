import feathers from 'feathers-client'
import io from 'socket.io-client'
import Vue from 'vue'
import VueSyncersFeathers from '../src'

// Feathers client
const socket = io()
const client = feathers().configure(feathers.socketio(socket))

// Install vue-syncers-feathers
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
