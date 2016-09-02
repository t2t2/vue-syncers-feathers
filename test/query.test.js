import test from 'ava'
import 'babel-register'
import matches from '../src/query'

test('Object matches partially', t => {
	t.truthy(matches({thing: true}, {thing: true}))
	t.falsy(matches({thing: false}, {thing: true}))

	t.truthy(matches({id: 1, thing: true}, {thing: true}))
	t.truthy(matches({id: 1, thing: false}, {thing: false}))
	t.truthy(matches({id: 1, thing: true}, {}))
	t.falsy(matches({id: 1, thing: false}, {thing: true}))
})

test('Ignores special filters', t => {
	t.truthy(matches({thing: true}, {thing: true, $sort: ['thing']}))
	t.truthy(matches({thing: true}, {thing: true, $limit: 10}))
	t.truthy(matches({thing: true}, {thing: true, $skip: 10}))
	t.truthy(matches({thing: true}, {thing: true, $select: ['thing']}))
	t.truthy(matches({thing: true}, {thing: true, $populate: ['thing']}))
})

test('Deep match', t => {
	t.truthy(matches({thing: {thang: true}}, {thing: {thang: true}}))
	t.falsy(matches({thing: {thang: false}}, {thing: {thang: true}}))
	t.truthy(matches({thing: {thang: false}}, {thing: {thang: false}}))

	t.truthy(matches({id: 1, thing: {thang: false}}, {thing: {thang: false}}))
	t.falsy(matches({id: 1, thing: {thang: false}}, {thus: {thang: false}}))
})

test('Or', t => {
	t.truthy(matches({thing: 1, thang: 2}, {$or: [{thing: 2}, {thang: 2}]}))
	t.falsy(matches({thing: 1, thang: 3}, {$or: [{thing: 2}, {thang: 2}]}))
	t.truthy(matches({thing: true}, {$or: [{missing: true}, {thing: true}]}))
	t.falsy(matches({thing: true}, {$or: [{missing: false}]}))
})

test('$in', t => {
	t.truthy(matches({thing: 3}, {thing: {$in: [1, 2, 3]}}))
	t.falsy(matches({thing: 4}, {thing: {$in: [1, 2, 3]}}))
})

test('$nin', t => {
	t.truthy(matches({thing: 4}, {thing: {$nin: [1, 2, 3]}}))
	t.falsy(matches({thing: 3}, {thing: {$nin: [1, 2, 3]}}))
})

test('$lt', t => {
	t.truthy(matches({thing: 3}, {thing: {$lt: 4}}))
	t.falsy(matches({thing: 4}, {thing: {$lt: 4}}))
	t.falsy(matches({thing: 5}, {thing: {$lt: 4}}))
})

test('$lte', t => {
	t.truthy(matches({thing: 3}, {thing: {$lte: 4}}))
	t.truthy(matches({thing: 4}, {thing: {$lte: 4}}))
	t.falsy(matches({thing: 5}, {thing: {$lte: 4}}))
})

test('$gt', t => {
	t.falsy(matches({thing: 3}, {thing: {$gt: 4}}))
	t.falsy(matches({thing: 4}, {thing: {$gt: 4}}))
	t.truthy(matches({thing: 5}, {thing: {$gt: 4}}))
})

test('$gte', t => {
	t.falsy(matches({thing: 3}, {thing: {$gte: 4}}))
	t.truthy(matches({thing: 4}, {thing: {$gte: 4}}))
	t.truthy(matches({thing: 5}, {thing: {$gte: 4}}))
})

test('$ne', t => {
	t.falsy(matches({thing: true}, {thing: {$ne: true}}))
	t.truthy(matches({thing: false}, {thing: {$ne: true}}))
	t.truthy(matches({id: 1}, {thing: {$ne: true}}))
})
