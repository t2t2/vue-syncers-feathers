<template>
	<div class="container">
		<div class="panel">
			<p>Item: <input type="number" v-model.number="targetInput" /></p>

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

		<pre class="panel vars" v-text="item"></pre>
	</div>
</template>

<script type="text/ecmascript-6">
	import debounce from 'lodash/debounce'

	export default {
		data: function () {
			return {
				error: null,
				target: 1,
				targetInput: 1
			}
		},
		created() {
			this.$on('syncer-error', (path, error) => {
				this.error = error
			})
		},
		methods: {
			updateTarget: debounce(function() {
				this.target = this.targetInput
			}, 200)
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
			targetInput() {
				// clear previous errors
				this.error = null

				this.updateTarget()
			},
		},
	}
</script>
