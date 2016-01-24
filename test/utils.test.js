import test from 'ava'
import 'babel-core/register'
import * as utils from '../src/utils'

test('every array', t => {
	let called = 0
	t.ok(utils.every([true, true], value => {
		called++
		return value
	}))
	t.is(called, 2)

	called = 0
	t.notOk(utils.every([false, true], value => {
		called++
		return value
	}))
	t.is(called, 1)
})

test('every object', t => {
	let called = 0
	t.ok(utils.every({one: true, two: true}, value => {
		called++
		return value
	}))
	t.is(called, 2)

	called = 0
	t.notOk(utils.every({one: false, two: true}, value => {
		called++
		return value
	}))
	t.is(called, 1)
})

test('isObject', t => {
	t.ok(utils.isObject({id: true}))
	t.ok(utils.isObject(['thing']))
	t.notOk(utils.isObject(1))
	t.notOk(utils.isObject(null))
})

test('isNumberLike', t => {
	t.ok(utils.isNumericIDLike('2'))

	// Ignore numbers
	t.notOk(utils.isNumericIDLike(1))
	t.notOk(utils.isNumericIDLike(1.2))
	// Ignore non-id
	t.notOk(utils.isNumericIDLike('2.6'))
	// Some sort of UUID that only has numbers (but should be string)
	t.notOk(utils.isNumericIDLike('132-3534-23'))
})