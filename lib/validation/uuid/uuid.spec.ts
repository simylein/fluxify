import { describe, expect, test } from 'bun:test';
import { randomUUID } from 'crypto';
import { uuid } from './uuid';

describe(uuid.name, () => {
	test('should have a correct type array', () => {
		expect(uuid().type).toEqual(['uuid']);
		expect(uuid().optional().type).toEqual(['uuid', 'undefined']);
		expect(uuid().nullable().optional().type).toEqual(['uuid', 'null', 'undefined']);
		expect(uuid().optional().nullable().type).toEqual(['uuid', 'undefined', 'null']);
	});

	test('should return a string if passed a valid uuid as string', () => {
		const id = randomUUID();
		expect(() => uuid().parse(id)).not.toThrow();
		expect(uuid().parse(id)).toEqual(id);
	});
});
