<template>
	<div class="app">
		<h1>vue-syncers-feathers demo page</h1>

		<h2>Basic todo list</h2>
		<todos ref="todos"></todos>

		<h2>One item</h2>
		<single ref="single"></single>

		<h2>Countries</h2>
		<countries ref="countries"></countries>
	</div>
</template>

<script type="text/ecmascript-6">
	import Countries from './components/countries.vue'
	import Single from './components/single.vue'
	import Todos from './components/todos.vue'

	export default {
		components: {
			Countries,
			Single,
			Todos
		}
	}
</script>

<style>
	.container {
		display: flex;
	}

	.container > .panel {
		width: 50%;
		padding: 0 1rem;
	}

	.container > .vars {
		max-height: 500px;
		overflow-y: auto;
	}
</style>
