import BaseVue from 'vue'
import VueSyncersFeathers from '../../../src'

export function addVueWithPlugin(t, options) {
	const Vue = t.context.Vue = BaseVue.extend()

	// Because we're installing onto extended vue instance copy global methods to new instance
	Vue.version = BaseVue.version
	Vue.util = BaseVue.util
	Vue.set = BaseVue.set
	Vue.delete = BaseVue.delete
	Vue.nextTick = BaseVue.nextTick
	// To reference the right Vue instance
	Vue.mixin = function (mixin) {
		Vue.options = Vue.util.mergeOptions(Vue.options, mixin)
	}

	BaseVue.use.call(Vue, {install: VueSyncersFeathers.install}, options)
}

export function addVueInstance(t) {
	t.context.instance = new BaseVue({
		data: function () {
			return {
				// To avoid vue-warn for setting paths on vm
				variables: {}
			}
		}
	})
}

export function vueCleanup(t) {
	if (t.context.instance) {
		t.context.instance.$destroy()
		delete t.context.instance
	}
	if (t.context.Vue) {
		delete t.context.Vue
	}
}
