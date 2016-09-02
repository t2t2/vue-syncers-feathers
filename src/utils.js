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

/**
 * Slimmed down version of _.some
 *
 * @param collection
 * @param predicate
 * @param thisArg
 */
export function some(collection, predicate, thisArg) {
	if (Array.isArray(collection)) {
		return collection.some(predicate, thisArg)
	}
	return Object.keys(collection).some(key => {
		return predicate.call(thisArg, collection[key], key, collection)
	})
}

/**
 * Slimmed down version of _.every
 *
 * @param collection
 * @param predicate
 * @param thisArg
 */
export function every(collection, predicate, thisArg) {
	if (Array.isArray(collection)) {
		return collection.every(predicate, thisArg)
	}
	return Object.keys(collection).every(key => {
		return predicate.call(thisArg, collection[key], key, collection)
	})
}

/**
 * Quick object check (from vue utils)
 *
 * @param obj
 * @returns {boolean}
 */
export function isObject(obj) {
	return obj !== null && typeof obj === 'object'
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
