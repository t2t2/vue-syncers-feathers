<template>
	<div class="container">
		<div class="panel">
			<div class="countries">
				<div class="form">
					<input type="text" v-model="search" debounce="500" />
					<div class="loading" v-if="$loadingSyncers">[Loading]</div>
				</div>
				<header class="country">
					<div class="alpha">AA</div>
					<div class="name">Name</div>
					<div class="languages">Languages</div>
				</header>
				<ul class="countries-list">
					<li class="country" v-for="country in countries" track-by="id">
						<div class="alpha" v-text="country.alpha3 || country.alpha2"></div>
						<div class="name" v-text="country.name"></div>
						<div class="languages" v-text="country.languages.join(', ')"></div>
					</li>
				</ul>
			</div>
		</div>
		<pre class="vars" v-text="countries | json"></pre>
	</div>

</template>

<script type="text/ecmascript-6">
	export default {
		data: function () {
			return {
				search: ''
			}
		},
		sync: {
			countries: {
				service: 'countries',
				query: function () {
					if (this.search) {
						return {
							name: {
								$like: this.search,
							},
						}
					} else {
						return {}
					}
				}
			},
		},
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