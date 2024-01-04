import { describe, expect, test } from 'bun:test';
import { expectType } from '../../test/expect-type';
import { updated } from '../updated/updated';

describe(updated.name, () => {
	test('should have a correct type', () => {
		expect(updated().type).toEqual('datetime');
		expectType<Date | null>(updated().parse(null));
	});

	test('should have the correct constraints', () => {
		expect(updated().constraints.default).toBeNull();
		expect(updated().constraints.hooks).toEqual({ onUpdate: `(datetime('now'))` });
		expect(updated().name('custom').constraints.name).toEqual('custom');
	});
});
