import { describe, expect, test } from 'bun:test';
import { expectType } from '../../test/expect-type';
import { deleted } from '../deleted/deleted';

describe(deleted.name, () => {
	test('should have a correct type', () => {
		expect(deleted().type).toEqual('datetime');
		expectType<Date | null>(deleted().parse(null));
	});

	test('should have the correct constraints', () => {
		expect(deleted().constraints.default).toEqual(null);
		expect(deleted().constraints.hooks).toEqual({ onDelete: `(datetime('now'))` });
		expect(deleted().name('custom').constraints.name).toEqual('custom');
	});
});
