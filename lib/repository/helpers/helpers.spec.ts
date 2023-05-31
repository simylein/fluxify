import { describe, expect, test } from 'bun:test';
import { determineOperator, orderBy, paginate, whereMany, whereOne } from './helpers';

describe(orderBy.name, () => {
	test('should return undefined given no order keys', () => {
		expect(orderBy()).toEqual(undefined);
	});

	test('should return a valid order by clause', () => {
		expect(orderBy({ name: 'asc' })).toEqual('order by name asc');
		expect(orderBy({ title: 'desc' })).toEqual('order by title desc');
		expect(orderBy({ name: 'asc', title: 'desc' })).toEqual('order by name asc,title desc');
	});
});

describe(determineOperator.name, () => {
	test('should return an equals for numbers', () => {
		expect(determineOperator({ amount: 4 }, 'amount')).toEqual('=');
	});

	test('should return is for null', () => {
		expect(determineOperator({ title: null }, 'title')).toEqual('is');
	});

	test('should return like for strings including a percent', () => {
		expect(determineOperator({ name: '%alice%' }, 'name')).toEqual('like');
	});
});

describe(whereOne.name, () => {
	test('should return undefined given an empty where object', () => {
		expect(whereOne({})).toEqual(undefined);
	});

	test('should return all values in an array', () => {
		expect(whereOne({ hello: 'world', how: 'are you', today: null })).toEqual(['world', 'are you', null]);
	});

	test('should return all values in an array and filter undefined', () => {
		expect(whereOne({ hello: 'world', how: 'are you', today: undefined })).toEqual(['world', 'are you']);
	});
});

describe(whereMany.name, () => {
	test('should return undefined given no where object', () => {
		expect(whereMany()).toEqual(undefined);
	});

	test('should return all values in an array', () => {
		expect(whereMany({ hello: 'world', how: 'are you', today: null })).toEqual(['world', 'are you', null]);
	});

	test('should return all values in an array and filter undefined', () => {
		expect(whereMany({ hello: 'world', how: 'are you', today: undefined })).toEqual(['world', 'are you']);
	});
});

describe(paginate.name, () => {
	test('should return a non limited limit clause given undefined', () => {
		expect(paginate(undefined, undefined)).toEqual('');
	});

	test('should return a valid limit clause given skip and take', () => {
		expect(paginate(10, undefined)).toEqual('limit 10');
		expect(paginate(undefined, 10)).toEqual('limit -1 offset 10');
		expect(paginate(100, 50)).toEqual('limit 100 offset 50');
	});
});
