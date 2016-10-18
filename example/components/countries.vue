<template>
	<div class="container">
		<div class="panel">
			<div class="countries">
				<div class="form">
					<input type="text" v-model="searchInput" />
					<div class="loading" v-if="searchIndicator">[{{ searchIndicator }}]</div>
				</div>
				<header class="country">
					<div class="alpha">AA</div>
					<div class="name">Name</div>
					<div class="languages">Languages</div>
				</header>
				<ul class="countries-list">
					<li class="country" v-for="country in countries" :key="country.id">
						<div class="alpha" v-text="country.alpha3 || country.alpha2"></div>
						<div class="name" v-text="country.name"></div>
						<div class="languages" v-text="country.languages.join(', ')"></div>
					</li>
				</ul>
			</div>
		</div>
		<pre class="vars" v-text="countries"></pre>
	</div>

</template>

<script type="text/ecmascript-6">
	import debounce from 'lodash/debounce'

	export default {
		data() {
			return {
				searchQuery: '',
				searchInput: ''
			}
		},
		computed: {
			searchIndicator() {
				if (this.$loadingSyncers) {
					return 'Loading'
				} else if (this.searchInput !== this.searchQuery) {
					return 'Typing'
				}
				return ''
			}
		},
		methods: {
			updateQuery: debounce(function() {
				this.searchQuery = this.searchInput
			}, 500)
		},
		sync: {
			countries: {
				service: 'countries',
				query() {
					if (this.searchQuery) {
						return {
							name: {
								// This uses a custom matcher on both server and client side
								$like: this.searchQuery
							}
						}
					} else {
						return {}
					}
				}
			}
		},
		watch: {
			searchInput() {
				this.updateQuery()
			}
		}
	}
</script>

<style>
	.form {
		display: flex;
	}

	.form > input {
		flex-grow: 1;
	}

	.form > .loading {
		margin-left: 1rem;
	}

	.countries-list {
		max-height: 25rem;
		margin-top: 0.5em;
		overflow-y: auto;
		padding: 0;
	}

	.country {
		display: flex;
		flex-direction: row;
	}

	.country > .alpha {
		width: 3em;
	}

	.country > .name {
		flex-grow: 1;
	}
</style>
