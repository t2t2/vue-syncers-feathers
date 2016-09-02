import test from 'ava'
import * as utils from '../src/utils'

test('every array', t => {
	let called = 0
	t.truthy(utils.every([true, true], value => {
		called++
		return value
	}))
	t.is(called, 2)

	called = 0
	t.falsy(utils.every([false, true], value => {
		called++
		return value
	}))
	t.is(called, 1)
})

test('every object', t => {
	let called = 0
	t.truthy(utils.every({one: true, two: true}, value => {
		called++
		return value
	}))
	t.is(called, 2)

	called = 0
	t.falsy(utils.every({one: false, two: true}, value => {
		called++
		return value
	}))
	t.is(called, 1)
})

test('isObject', t => {
	t.truthy(utils.isObject({id: true}))
	t.truthy(utils.isObject(['thing']))
	t.falsy(utils.isObject(1))
	t.falsy(utils.isObject(null))
})

test('isNumberLike', t => {
	t.truthy(utils.isNumericIDLike('2'))

	// Ignore numbers
	t.falsy(utils.isNumericIDLike(1))
	t.falsy(utils.isNumericIDLike(1.2))
	// Ignore non-id
	t.falsy(utils.isNumericIDLike('2.6'))
	// Some sort of UUID that only has numbers (but should be string)
	t.falsy(utils.isNumericIDLike('132-3534-23'))
})
