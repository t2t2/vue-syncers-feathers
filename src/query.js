// Provides query based filtering on the frontend
// Based on source of feathers-memory

import {every, isObject, some} from './utils'

export const baseIgnoredKeys = ['$sort', '$limit', '$skip', '$select', '$populate']

export const baseSpecialFilters = {
	$in(item, query) {
		return query.indexOf(item) !== -1
	},
	$nin(item, query) {
		return query.indexOf(item) === -1
	},
	$lt(item, query) {
		return item < query
	},
	$lte(item, query) {
		return item <= query
	},
	$gt(item, query) {
		return item > query
	},
	$gte(item, query) {
		return item >= query
	},
	$ne(item, query) {
		return item !== query
	}
}

/**
 * Creates matcher that you'd most likely use if your query is / near-is like feathers defaults
 *
 * @param specialFilters
 * @param ignoredKeys
 * @returns {matches}
 */
export function createMatcher(specialFilters = baseSpecialFilters, ignoredKeys = baseIgnoredKeys) {
	return function matches(item, query, root = true) {
		return every(query, (filterValue, filterKey) => {
			// Root keys that aren't cared about
			if (root && ignoredKeys.indexOf(filterKey) !== -1) {
				return true
			}
			// or clause
			if (filterKey === '$or') {
				return some(filterValue, function (newQuery) {
					return matches(item, newQuery, false)
				})
			}
			// Special filters
			if (filterKey in specialFilters) {
				return specialFilters[filterKey](item, filterValue)
			}
			// If gotten this deep and item is undefined (to allow for $ne !== undefined)
			if (item === undefined) {
				return false
			}
			// Go deeper
			if (isObject(filterValue)) {
				return matches(item[filterKey], filterValue, false)
			}
			// Match
			return filterKey in item && item[filterKey] === filterValue
		})
	}
}

export default createMatcher()
