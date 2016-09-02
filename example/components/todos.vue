<template>
	<div class="container todos">
		<div class="panel todo-app">
			<header class="todo-header">
				<input type="checkbox" v-model="allDone">
				<input type="text"
				       class="todo-title-field"
				       :disabled="creating"
				       v-model="newTodo"
				       @keyup.enter="addTodo">
			</header>
			<section class="todo-content">
				<ul class="todo-list">
					<li class="todo" v-for="todo in todos">
						<div class="todo-view" v-if="editing !== todo.id">
							<input type="checkbox"
							       :checked="todo.completed"
							       @change="toggleTodo($event, todo)"
							/>
							<label class="todo-title"
							       v-text="todo.title"
							       @dblclick="editTodo(todo)"
							></label>
							<button class="todo-destroy" @click="removeTodo(todo)">x</button>
						</div>
						<div class="todo-edit" v-if="editing === todo.id">
							<input type="text"
							       class="todo-title-field"
							       :value="todo.title"
							       @blur="doneEdit($event, todo)"
							       @keyup.enter="doneEdit($event, todo)"
							       @keyup.esc="cancelEdit(todo)"
							/>
						</div>
					</li>
				</ul>
			</section>
			<footer class="todo-footer">
				{{remaining}} {{remaining | pluralize 'item'}} left
			</footer>
		</div>
		<pre class="panel vars" v-text="todos | json"></pre>
	</div>
</template>

<script type="text/ecmascript-6">
	import filter from 'lodash/filter'

	export default {
		data: function () {
			return {
				creating: false,
				editing: null,
				newTodo: '',
			}
		},
		computed: {
			remaining() {
				return filter(this.todos, {completed: false}).length
			},
			allDone: {
				get() {
					return this.remaining === 0
				},
				set(value) {
					return this.$feathers.service('todos').patch(null, {
						completed: value,
					}).catch((error) => {
						console.error(error)
					})
				},
			},
		},
		methods: {
			addTodo() {
				var value = this.newTodo && this.newTodo.trim();
				if (!value || this.creating) {
					return;
				}

				this.creating = true
				return this.$feathers.service('todos').create({
					title: value,
					completed: false,
				}).then(() => {
					this.newTodo = ''
					this.creating = false
				}).catch((error) => {
					console.error(error)
				})
			},
			cancelEdit() {
				this.editing = null
			},
			doneEdit(event, todo){
				var value = event.target.value.trim();
				if (!value) {
					return this.removeTodo(todo)
				}

				return this.$feathers.service('todos').patch(todo.id, {title: value}).then(() => {
					this.editing = null
				})
			},
			editTodo(todo) {
				this.editing = todo.id
			},
			removeTodo(todo) {
				return this.$feathers.service('todos').remove(todo.id).catch((error) => {
					console.error(error)
				})
			},
			toggleTodo(event, todo) {
				const newState = event.target.checked
				return this.$feathers.service('todos').patch(todo.id, {completed: newState})
			},
		},
		sync: {
			todos: 'todos',
		},
	}
</script>

<style>
	.todo-app {
		display: flex;
		flex-direction: column;
	}

	.todo-header {
		display: flex;
	}

	.todo-title-field {
		flex-grow: 1;
	}

	.todo-list {
		display: flex;
		flex-direction: column;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.todo-view, .todo-edit {
		display: flex;
	}

	.todo-title {
		flex-grow: 1;
	}
</style>