import { describe, expect, test } from 'bun:test';
import { boolean } from '../boolean/boolean';
import { number } from '../number/number';
import { object } from '../object/object';
import { string } from '../string/string';
import { array } from './array';

describe(array.name, () => {
	test('should have a correct type array', () => {
		expect(array(number()).type).toEqual(['array']);
		expect(array(number()).optional().type).toEqual(['array', 'undefined']);
		expect(array(number()).optional().nullable().type).toEqual(['array', 'undefined', 'null']);
	});

	test('should validate a simple array of numbers', () => {
		const sequence = [1, 2, 3, 4];
		expect(() => array(number()).parse(sequence)).not.toThrow();
		expect(array(number()).parse(sequence)).toEqual(sequence);
	});

	test('should validate a simple array of strings', () => {
		const sequence = ['hello', 'world', 'how', 'are', 'you'];
		expect(() => array(string()).parse(sequence)).not.toThrow();
		expect(array(string()).parse(sequence)).toEqual(sequence);
	});

	test('should validate a simple array of booleans', () => {
		const sequence = [false, true, true, false];
		expect(() => array(boolean()).parse(sequence)).not.toThrow();
		expect(array(boolean()).parse(sequence)).toEqual(sequence);
	});

	test('should validate an array of objects', () => {
		const users = [
			{
				id: 1,
				name: 'alice',
			},
			{
				id: 2,
				name: 'bob',
			},
		];
		const schema = object({
			id: number(),
			name: string(),
		});
		expect(() => array(schema).parse(users)).not.toThrow();
		expect(array(schema).parse(users)).toEqual(users);
	});
});
