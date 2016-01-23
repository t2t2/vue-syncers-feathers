import test from 'ava'
import 'babel-core/register'
import matches from '../src/query'

test('Object matches partially', t => {
	t.ok(matches({thing: true}, {thing: true}))
	t.notOk(matches({thing: false}, {thing: true}))

	t.ok(matches({id: 1, thing: true}, {thing: true}))
	t.ok(matches({id: 1, thing: false}, {thing: false}))
	t.ok(matches({id: 1, thing: true}, {}))
	t.notOk(matches({id: 1, thing: false}, {thing: true}))
})

test('Ignores special filters', t => {
	t.ok(matches({thing: true}, {thing: true, $sort: ['thing']}))
	t.ok(matches({thing: true}, {thing: true, $limit: 10}))
	t.ok(matches({thing: true}, {thing: true, $skip: 10}))
	t.ok(matches({thing: true}, {thing: true, $select: ['thing']}))
	t.ok(matches({thing: true}, {thing: true, $populate: ['thing']}))
})

test('Deep match', t => {
	t.ok(matches({thing: {thang: true}}, {thing: {thang: true}}))
	t.notOk(matches({thing: {thang: false}}, {thing: {thang: true}}))
	t.ok(matches({thing: {thang: false}}, {thing: {thang: false}}))

	t.ok(matches({id: 1, thing: {thang: false}}, {thing: {thang: false}}))
	t.notOk(matches({id: 1, thing: {thang: false}}, {thus: {thang: false}}))
})

test('Or', t => {
	t.ok(matches({thing: 1, thang: 2}, {$or: [{thing: 2}, {thang: 2}]}))
	t.notOk(matches({thing: 1, thang: 3}, {$or: [{thing: 2}, {thang: 2}]}))
	t.ok(matches({thing: true}, {$or: [{missing: true}, {thing: true}]}))
	t.notOk(matches({thing: true}, {$or: [{missing: false}]}))
})

test('$in', t => {
	t.ok(matches({thing: 3}, {thing: {$in: [1, 2, 3]}}))
	t.notOk(matches({thing: 4}, {thing: {$in: [1, 2, 3]}}))
})

test('$nin', t => {
	t.ok(matches({thing: 4}, {thing: {$nin: [1, 2, 3]}}))
	t.notOk(matches({thing: 3}, {thing: {$nin: [1, 2, 3]}}))
})

test('$lt', t => {
	t.ok(matches({thing: 3}, {thing: {$lt: 4}}))
	t.notOk(matches({thing: 4}, {thing: {$lt: 4}}))
	t.notOk(matches({thing: 5}, {thing: {$lt: 4}}))
})

test('$lte', t => {
	t.ok(matches({thing: 3}, {thing: {$lte: 4}}))
	t.ok(matches({thing: 4}, {thing: {$lte: 4}}))
	t.notOk(matches({thing: 5}, {thing: {$lte: 4}}))
})

test('$gt', t => {
	t.notOk(matches({thing: 3}, {thing: {$gt: 4}}))
	t.notOk(matches({thing: 4}, {thing: {$gt: 4}}))
	t.ok(matches({thing: 5}, {thing: {$gt: 4}}))
})

test('$gte', t => {
	t.notOk(matches({thing: 3}, {thing: {$gte: 4}}))
	t.ok(matches({thing: 4}, {thing: {$gte: 4}}))
	t.ok(matches({thing: 5}, {thing: {$gte: 4}}))
})

test('$ne', t => {
	t.notOk(matches({thing: true}, {thing: {$ne: true}}))
	t.ok(matches({thing: false}, {thing: {$ne: true}}))
	t.ok(matches({id: 1}, {thing: {$ne: true}}))
})
