# vue-syncers-feathers

> Synchronises feathers services with vue objects, updated in real-time

[![Build Status](https://travis-ci.org/t2t2/vue-syncers-feathers.svg?branch=master)](https://travis-ci.org/t2t2/vue-syncers-feathers)
[![Coverage Status](https://coveralls.io/repos/github/t2t2/vue-syncers-feathers/badge.svg?branch=master)](https://coveralls.io/github/t2t2/vue-syncers-feathers?branch=master)
[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/t2t2/vue-syncers-feathers/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/t2t2/vue-syncers-feathers/?branch=master)

[Changelog on GitHub releases](https://github.com/t2t2/vue-syncers-feathers/releases)

## Setup

`npm install vue-syncers-feathers feathers-commons feathers-query-filters --save`

### Webpack/Browserify

```js
// Set up feathers client
// You can do this whatever way you prefer, eg. feathers-client
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

* `aliases` - [Enable shorter syntax](#aliases)
* `feathers` **[REQUIRED]** - [feathers client](http://docs.feathersjs.com/clients/readme.html) instance
* `idField` - Default idField value (see [syncer settings](#general-syncer-settings)), defaults to `id`

**ADVANCED** - Most of the time you do not need these

* `driver` - Swapping out syncers with your own custom version. See `src/syncer.js`
* `filter` - Function that parses the query for special filters.
Check [feathers-query-filters](https://github.com/feathersjs/feathers-query-filters) for syntax.
* `matcher` - Function that creates a matcher used to check if an item matches the query.
By default [feathers-commons](https://github.com/feathersjs/feathers-commons) matcher is used.

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
value: `string|object` Service to use, or options object:

#### General syncer settings

* `service`: `string` service to use (same as `feathers.service(value)`)
* `idField`: `string` ID field (defaults to `id`)
* `loaded`: `function()` that will be executed when the syncer is loaded. This can happen multiple times (if data is loaded again).
* `errored`:  `function(error)` that will be executed when the syncer loads an error. This can happen multiple times (if data is loaded again).

To use loaded and error event handler on all syncers check [instance events](#instance-events)

#### Collection options (default)

* `query`: `function()|string` query to send to the server

`vm.key` will be object where keys are object IDs (empty if none matches/all deleted)

#### Single item options (if id is set)

* `id`: `function()|string` function that returns the item ID to fetch.

`vm.key` will be the object which ID matches (or null on error/deletion)

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

### Instance methods

* `vm.$refreshSyncers([path])` - Refresh syncers on this instance. Path can be key or array of keys to refresh.
If not set, all syncers are updated. Note that this does not need to be called after creating/updating/removing items
unless [events have been disabled](https://docs.feathersjs.com/real-time/filtering.html).

### Instance properties

* `vm.$feathers` - Feathers client
* `vm.$loadingSyncers` (reactive) - true if any syncers are in loading state

### Instance events

* `syncer-loaded(key)` - Emitted when one of the syncers finishes loading it's data
* `syncer-error(key, error)` - Emitted when one of the syncers results in error while loading it's data

## Aliases

For cleaner code you can enable the following aliases by setting `aliases` option true in the `Vue.use` call.
Note that these aren't enabled by default to avoid conflicts with any other vue plugins you might be using.

Alias | Is same as | Key for individual enabling
---|---|---
`vm.$loading` | `vm.$loadingSyncers` | `loading`
`vm.$refresh()` | `vm.$refreshSyncers` | `refresh`
`vm.$service(name)` | `vm.$feathers.service(name)` | `service`

```js
// Enable all
Vue.use(VueSyncersFeathers, {
	aliases: true,
	feathers: client
})
// Enable some
Vue.use(VueSyncersFeathers, {
	aliases: {
		loading: true,
		service: true
	},
	feathers: client
})
```

Example component with aliases:

```vue
<template>
	<div>
		<div v-if="$loading">Loading...</div>
		[...]
	</div>
</template>
<script>
export default {
	methods: {
		addNewUser(user) {
			this.$service('users').create(user).then(() => {
				//...
			})
		}
	},
	sync: {
		users: 'users',
	}
}
</script>

```

## FAQ

* Can I use computed variables in query/id  
Yes
* Can I use results in computed variables  
Yes
* Vue-router/other plugin's objec--  
Untested, but probably anything that integrates with vue (and properly defines reactivity) works

## Compatibility warnings:

* `feathers-socket-commons 2.2.0 - 2.3.0`: Broken event listener removal
