import { describe, expect, test } from 'bun:test';
import { determineOperator, lessEqualThan, lessThan, like, moreEqualThan, moreThan, not } from './operators';

describe(determineOperator.name, () => {
	test('should return an equals by default', () => {
		expect(determineOperator({ name: 'hello' }, 'name')).toEqual('=');
		expect(determineOperator({ amount: 42 }, 'amount')).toEqual('=');
		expect(determineOperator({ active: false }, 'active')).toEqual('=');
	});

	test('should return != for not operator', () => {
		expect(determineOperator({ id: not(73) }, 'id')).toEqual('!=');
	});

	test('should return like for like operator', () => {
		expect(determineOperator({ name: like('%alice%') }, 'name')).toEqual('like');
	});

	test('should return > for more than operator', () => {
		expect(determineOperator({ likes: moreThan(20) }, 'likes')).toEqual('>');
	});

	test('should return < for less than operator', () => {
		expect(determineOperator({ dislikes: lessThan(10) }, 'dislikes')).toEqual('<');
	});

	test('should return >= for more equal than operator', () => {
		expect(determineOperator({ likes: moreEqualThan(20) }, 'likes')).toEqual('>=');
	});

	test('should return <= for less equal than operator', () => {
		expect(determineOperator({ dislikes: lessEqualThan(10) }, 'dislikes')).toEqual('<=');
	});
});
