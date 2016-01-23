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
