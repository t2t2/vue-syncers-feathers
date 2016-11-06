import {each} from './utils'

const variables = {
	loading: function () {
		return this.$loadingSyncers
	}
}

const methods = {
	refresh: function (...args) {
		return this.$refreshSyncers(...args)
	},
	service: function (...args) {
		return this.$feathers.service(...args)
	}
}

/**
 * Create mixin by passed in options
 *
 * @param {Boolean|Object} options
 */
export default function aliasesMixinMaker(options) {
	let isEnabled
	if (typeof options === 'boolean') {
		isEnabled = () => options
	} else {
		isEnabled = key => {
			return key in options && options[key]
		}
	}

	const mixin = {
		computed: {}, // variables
		methods: {}
	}

	each(variables, (getter, key) => {
		if (isEnabled(key)) {
			mixin.computed[`$${key}`] = getter
		}
	})

	each(methods, (caller, key) => {
		if (isEnabled(key)) {
			mixin.methods[`$${key}`] = caller
		}
	})

	return mixin
}
