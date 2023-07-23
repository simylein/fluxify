import { describe, expect, test } from 'bun:test';
import { primary } from './primary';

describe(primary.name, () => {
	test('should have a correct type array', () => {
		expect(primary('uuid').type).toEqual('character');
		expect(primary('increment').type).toEqual('integer');
	});

	test('should have the correct constraints', () => {
		expect(primary('uuid').constraints).toEqual({ length: 36, primary: true, nullable: false, unique: true });
		expect(primary('increment').constraints).toEqual({ primary: true, nullable: false, unique: true });
	});
});
