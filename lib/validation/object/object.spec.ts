import { describe, expect, test } from 'bun:test';
import { expectType } from '../../test/expect-type';
import { boolean } from '../boolean/boolean';
import { ValidationError } from '../error';
import { number } from '../number/number';
import { Type } from '../parser.type';
import { string } from '../string/string';
import { keyIsMissing, keyIsNot, keyNotWanted, object } from './object';

describe(keyIsNot.name, () => {
	test('should be an instance of validation error', () => {
		expect(keyIsNot('key', ['string'], 42)).toBeInstanceOf(ValidationError);
	});

	test('should throw an error indicating that the key has the wrong type', () => {
		expect(() => keyIsNot('key', ['string'], 42)).toThrow(Error('key is not of type string (number given)'));
		expect(() => keyIsNot('key', ['number'], true)).toThrow(Error('key is not of type number (boolean given)'));
		expect(() => keyIsNot('key', ['boolean'], {})).toThrow(Error('key is not of type boolean (object given)'));
		expect(() => keyIsNot('key', ['object'], [])).toThrow(Error('key is not of type object (array given)'));
		expect(() => keyIsNot('key', ['array'], undefined)).toThrow(Error('key is not of type array (undefined given)'));
		expect(() => keyIsNot('key', ['date'], null)).toThrow(Error('key is not of type date (null given)'));
	});
});

describe(keyIsMissing.name, () => {
	test('should be an instance of validation error', () => {
		expect(keyIsMissing('key', 'string')).toBeInstanceOf(ValidationError);
	});

	test('should throw an error indicating that the key is missing', () => {
		expect(() => keyIsMissing('key', 'string')).toThrow(Error('key is missing and should be of type string'));
		expect(() => keyIsMissing('key', 'number')).toThrow(Error('key is missing and should be of type number'));
		expect(() => keyIsMissing('key', 'object')).toThrow(Error('key is missing and should be of type object'));
		expect(() => keyIsMissing('key', 'array')).toThrow(Error('key is missing and should be of type array'));
		expect(() => keyIsMissing('key', 'undefined')).toThrow(Error('key is missing and should be of type undefined'));
		expect(() => keyIsMissing('key', 'null')).toThrow(Error('key is missing and should be of type null'));
	});
});

describe(keyNotWanted.name, () => {
	test('should be an instance of validation error', () => {
		expect(keyNotWanted('key')).toBeInstanceOf(ValidationError);
	});

	test('should throw an error indicating that the key should not exist', () => {
		expect(() => keyNotWanted('key')).toThrow(Error('key should not exist'));
		expect(() => keyNotWanted('another-key')).toThrow(Error('another-key should not exist'));
	});
});

describe(object.name, () => {
	test('should have a correct type array', () => {
		expect(object({}).type).toEqual(['object']);
		expect(object({}).optional().type).toEqual(['object', 'undefined']);
		expect(object({}).optional().nullable().type).toEqual(['object', 'undefined', 'null']);
		expectType<Type[]>(object({}).type);
	});

	test('should validate a simple user object', () => {
		const schema = {
			id: number(),
			name: string(),
			age: number(),
			active: boolean(),
		};
		expect(() =>
			object(schema).parse({
				id: 1,
				name: 'simylein',
				age: 42,
				active: false,
			}),
		).not.toThrow();
		expectType<{ id: number; name: string; age: number; active: boolean }>(
			object(schema).parse({
				id: 1,
				name: 'simylein',
				age: 42,
				active: false,
			}),
		);
	});

	test('should throw for all incorrect types', () => {
		const schema = {
			id: number(),
			name: string(),
			age: number(),
			active: boolean(),
		};
		expect(() =>
			object(schema).parse({
				id: 'deadbeef',
				name: 'simylein',
				age: 42,
				active: false,
			}),
		).toThrow(Error('id is not of type number'));
		expect(() =>
			object(schema).parse({
				name: 'simylein',
				age: 42,
				active: false,
			}),
		).toThrow(Error('id is missing and should be of type number'));
	});

	test('should validate and ignore optional keys if they are undefined', () => {
		const schema = {
			id: number(),
			name: string(),
			age: number().optional(),
			active: boolean().optional(),
		};
		expect(() =>
			object(schema).parse({
				id: 1,
				name: 'simylein',
				age: 42,
				active: false,
			}),
		).not.toThrow();
		expect(() =>
			object(schema).parse({
				id: 1,
				name: 'simylein',
				age: undefined,
				active: undefined,
			}),
		).not.toThrow();
		expect(() =>
			object(schema).parse({
				id: 1,
				name: 'simylein',
			}),
		).not.toThrow();
		expectType<{ id: number; name: string; age?: number; active?: boolean }>(
			object(schema).parse({ id: 1, name: 'simylein' }),
		);
	});
});
