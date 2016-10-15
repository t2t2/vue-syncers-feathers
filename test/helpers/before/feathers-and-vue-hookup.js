// So many netflix and chill jokes, so little time
import {addFeathersInstance, feathersCleanup} from './feathers-hookup'
import {addVueWithPlugin, vueCleanup} from './vue-hookup'

export async function addVueAndFeathers(t) {
	await addFeathersInstance(t)
	addVueWithPlugin(t, {feathers: t.context.client})
}

export function vueAndFeathersCleanup(t) {
	vueCleanup(t)
	feathersCleanup(t)
}
