import { describe, expect, test } from 'bun:test';
import { primary } from './primary';

describe(primary.name, () => {
	test('should have a correct type array', () => {
		expect(primary().type).toEqual('varchar');
	});

	test('should have the correct constraints', () => {
		expect(primary().constraints).toEqual({ length: 36, primary: true, unique: true });
	});
});
