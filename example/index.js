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

// Patch in {$like: 'var'} ability to special filters
require('feathers-commons/lib/utils').specialFilters.$like = function (key, value) {
	value = value.toString().toLowerCase()
	return function (current) {
		return current[key].toString().toLowerCase().indexOf(value) !== -1
	}
}

// Install vue-syncers-feathers
Vue.use(VueSyncersFeathers, {
	feathers: client
})

// Create instance
const app = global.app = new Vue(App)
app.$mount('#app')
