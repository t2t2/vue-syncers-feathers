import test from 'ava'
import * as utils from '../src/utils'

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
