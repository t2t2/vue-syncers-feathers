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

/**
 * Check if object is JSONable
 *
 * @from https://github.com/vuejs/vue/blob/0b902e0c28f4f324ffb8efbc9db74127430f8a42/src/shared/util.js#L155
 * @param {*} obj
 * @returns {boolean}
 */
function isObject(obj) {
	return obj !== null && typeof obj === 'object'
}

/**
 * Loosely check if objects are equal
 *
 * @from https://github.com/vuejs/vue/blob/0b902e0c28f4f324ffb8efbc9db74127430f8a42/src/shared/util.js
 * @param {*} a
 * @param {*} b
 * @returns {boolean}
 */
export function looseEqual(a, b) {
	const isObjectA = isObject(a)
	const isObjectB = isObject(b)
	if (isObjectA && isObjectB) {
		try {
			return JSON.stringify(a) === JSON.stringify(b)
		} catch (err) {
			// possible circular reference
			return a === b
		}
	} else if (!isObjectA && !isObjectB) {
		return String(a) === String(b)
	} else {
		return false
	}
}
