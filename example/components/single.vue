<template>
	<div class="container">
		<div class="panel">
			<p>Item: <input type="number" v-model="target" debounce="200" number /></p>

			<div v-if="error">
				<h4>{{ error.message }}</h4>
			</div>

			<div v-if="$loadingSyncers">
				Loading...
			</div>
			<div v-else>
				<div v-if="item">
					ID: {{item.id}}<br />
					Title: {{item.title}}<br />
					Completed: {{item.completed}}
				</div>
				<div v-else>
					No item found
				</div>
			</div>
		</div>

		<pre class="panel vars" v-text="item | json"></pre>
	</div>
</template>

<script type="text/ecmascript-6">
	export default {
		data: function () {
			return {
				error: null,
				target: 1,
			}
		},
		events: {
			'syncer-error' (path, error) {
				this.error = error
			},
		},
		sync: {
			item: {
				service: 'todos',
				id() {
					return this.target
				},
			},
		},
		watch: {
			target () {
				// clear previous errors
				this.error = null
			},
		},
	}
</script>
