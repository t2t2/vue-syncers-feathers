# vue-syncers-feathers

> Synchronises feathers services with vue objects, updated in real-time

[![Build Status](https://travis-ci.org/t2t2/vue-syncers-feathers.svg?branch=master)](https://travis-ci.org/t2t2/vue-syncers-feathers)
[![Coverage Status](https://coveralls.io/repos/github/t2t2/vue-syncers-feathers/badge.svg?branch=master)](https://coveralls.io/github/t2t2/vue-syncers-feathers?branch=master)

[Changelog on GitHub releases](https://github.com/t2t2/vue-syncers-feathers/releases)

## Setup

### Webpack/Browserify

`npm install vue-syncers-feathers --save`

```js
// Set up feathers client
// You can do this whatever way you prefer, eg. feathers-client, or a more lightweight shim that exposes approtiate client.service(path)
import feathers from 'feathers/client'
import feathersIO from 'feathers-socketio/client'
import io from 'socket.io-client'
const socket = io()
const client = feathers().configure(feathers.socketio(socket))

// Set up vue & VueSyncersFeathers
import Vue from 'vue'
import VueSyncersFeathers from 'vue-syncers-feathers'

Vue.use(VueSyncersFeathers, {
	feathers: client
})
```

### Configuration

* `driver` **[ADVANCED]** - Swapping out driver that does fetching and keeping up to date with feathers server (Yes, you
could technically write a driver for firebase/meteor/manual... and split the core off to it's own thing)
* `feathers` **[REQUIRED]** - [feathers client](http://docs.feathersjs.com/clients/readme.html) instance

## Usage

```vue
<template>
	<div class="user-list">
		<div v-for="user in userList">
			{{user | json}}
		</div>
	</div>
</template>
<script>
export default {
	sync: {
		// put all results in users service on userList
		userList: 'users',
		// put a user with id 1 on userObject
		userObject: {
			service: 'users',
			id() {
				return 1
			}
		},
		// put filtered users list on specialUsers
		specialUsers: {
			service: 'users',
			query() {
				return {
					// All users where user.special === true
					special: true
				}
			}
		}
	}
}
</script>
```

### `sync` option object

key: path where the object will be (`vm.key`)  
value: `string|object` Service to use, or options object for advanced use

#### General

* service: service to use (same as `feathers.service(value)`)
* idField: ID field (defaults to `id`, only needed if you did the same server-side)

#### Collection options (default)

* query: `function|string` query to send to the server

Returns on path object where keys are object IDs (empty if none matches/all deleted)

#### Single item options (if id is set)

* id: `function|string` function that returns the item ID to fetch.

Returns on path the object which ID matches (or null on error/deletion)

### Reactivity

Both id and query are sent to [vm.$watch](http://vuejs.org/api/#vm-watch) to get and observe the value. If the value
is changed (eg. `id: () => { return this.shownUserId }` and `this.shownUserId = 3` later), the new object is requested
from the server. If new the value is `null`, the request won't be sent and current value is set to empty object
(collection mode) or null (single item mode)

```js
export default {
	data() {
		return {
			userId: 1
		}
	},
	sync: {
		user: {
			service: 'users',
			id() {
				return this.userId
			}
		}
	}
}

instance.userId = 2 // loads user id = 2
```

### Instance properties

* vm.$loadingSyncers (reactive) - true if any syncers are in loading state

### Instance events

* `syncer-loaded`(`path`) - Emitted when one of the syncers finishes loading it's data
* `syncer-error`(`path`, `error`) - Emitted when one of the syncers results in error while loading it's data

## FAQ

* Can I use computed variables in query/id  
Yes
* Can I use results in computed variables  
Yes
* Vue-router/other plugin's objec--  
Untested, but probably anything that integrates with vue (and properly defines reactivity) works

## Compatibility warnings:

* `feathers-socket-commons 2.2.0 - 2.3.0`: Broken event listener removal
