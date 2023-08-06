import { describe, expect, test } from 'bun:test';
import { expectType } from '../../test/expect-type';
import { created } from '../created/created';

describe(created.name, () => {
	test('should have a correct type', () => {
		expect(created().type).toEqual('datetime');
		expectType<Date>(created().parse(null));
	});

	test('should have the correct constraints', () => {
		expect(created().constraints.default).toEqual(`(datetime('now'))`);
		expect(created().constraints.hooks).toEqual({ onInsert: `(datetime('now'))` });
		expect(created().name('custom').constraints.name).toEqual('custom');
	});
});
