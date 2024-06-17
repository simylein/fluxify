import { describe, expect, test } from 'bun:test';
import { expectType } from '../../test/expect-type';
import { boolean } from '../boolean/boolean';
import { ValidationError } from '../error';
import { number } from '../number/number';
import { object } from '../object/object';
import { Type } from '../parser.type';
import { string } from '../string/string';
import { array, indexIsMissing, indexIsNot } from './array';

describe(indexIsNot.name, () => {
	test('should be an instance of validation error', () => {
		expect(indexIsNot(2, ['string'], 42)).toBeInstanceOf(ValidationError);
	});
});

describe(indexIsMissing.name, () => {
	test('should throw an error indicating that the key at index has the wrong type', () => {
		expect(() => indexIsMissing(2, 'string')).toThrow(Error('index 2 is missing and should be of type string'));
		expect(() => indexIsMissing(2, 'number')).toThrow(Error('index 2 is missing and should be of type number'));
		expect(() => indexIsMissing(2, 'boolean')).toThrow(Error('index 2 is missing and should be of type boolean'));
		expect(() => indexIsMissing(2, 'object')).toThrow(Error('index 2 is missing and should be of type object'));
		expect(() => indexIsMissing(2, 'array')).toThrow(Error('index 2 is missing and should be of type array'));
		expect(() => indexIsMissing(2, 'date')).toThrow(Error('index 2 is missing and should be of type date'));
	});
});

describe(array.name, () => {
	test('should have a correct type array', () => {
		expect(array(number()).type).toEqual(['array']);
		expect(array(number()).optional().type).toEqual(['array', 'undefined']);
		expect(array(number()).optional().nullable().type).toEqual(['array', 'undefined', 'null']);
		expectType<Type[]>(array(number()).type);
	});

	test('should validate a simple array of numbers', () => {
		const sequence = [1, 2, 3, 4];
		expect(() => array(number()).parse(sequence)).not.toThrow();
		expect(array(number()).parse(sequence)).toEqual(sequence);
		expectType<number[]>(array(number()).parse(sequence));
	});

	test('should validate a simple array of strings', () => {
		const sequence = ['hello', 'world', 'how', 'are', 'you'];
		expect(() => array(string()).parse(sequence)).not.toThrow();
		expect(array(string()).parse(sequence)).toEqual(sequence);
		expectType<string[]>(array(string()).parse(sequence));
	});

	test('should validate a simple array of booleans', () => {
		const sequence = [false, true, true, false];
		expect(() => array(boolean()).parse(sequence)).not.toThrow();
		expect(array(boolean()).parse(sequence)).toEqual(sequence);
		expectType<boolean[]>(array(boolean()).parse(sequence));
	});

	test('should respect the minimum value and else throw', () => {
		expect(() => array(number()).min(3).parse([1, 2, 3, 4])).not.toThrow();
		expect(() => array(number()).min(4).parse([1, 2, 3, 4])).not.toThrow();
		expect(() => array(number()).min(5).parse([1, 2, 3, 4])).toThrow();
		expectType<Array<number>>(array(number()).min(3).parse([1, 2, 3, 4]));
	});

	test('should respect the maximum value and else throw', () => {
		expect(() => array(number()).max(7).parse([1, 2, 3, 4, 5, 6, 7, 8])).toThrow();
		expect(() => array(number()).max(8).parse([1, 2, 3, 4, 5, 6, 7, 8])).not.toThrow();
		expect(() => array(number()).max(9).parse([1, 2, 3, 4, 5, 6, 7, 8])).not.toThrow();
		expectType<Array<number>>(array(number()).max(9).parse([1, 2, 3, 4, 5, 6, 7, 8]));
	});

	test('should validate an array of objects', () => {
		const users = [
			{ id: 1, name: 'alice' },
			{ id: 2, name: 'bob' },
		];
		const schema = object({
			id: number(),
			name: string(),
		});
		expect(() => array(schema).parse(users)).not.toThrow();
		expect(array(schema).parse(users)).toEqual(users);
		expectType<{ id: number; name: string }[]>(array(schema).parse(users));
	});
});
