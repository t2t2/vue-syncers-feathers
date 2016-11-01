import * as feathersUtil from 'feathers-commons/lib/utils'

export const each = feathersUtil.each
export const some = feathersUtil._.some

/**
 * Empty function
 */
export function noop() {
}

/**
 * Log debug in user's console
 *
 * @param args
 */
export function warn(...args) {
	/* istanbul ignore next */
	if (console || window.console) {
		console.warn('[vue-syncers-feathers]', ...args)
	}
}

const numberRegex = /^\d+$/

/**
 * Test if a value seems like a number
 *
 * @param value
 * @returns {boolean}
 */

export function isNumericIDLike(value) {
	return (typeof value !== 'number' && numberRegex.test(value))
}

/**
 * Return object with only selected keys
 *
 * @from https://github.com/feathersjs/feathers-memory
 * @param source
 * @param keys
 * @returns {object}
 */
export function pick(source, ...keys) {
	const result = {}
	for (let key of keys) {
		result[key] = source[key]
	}
	return result
}
