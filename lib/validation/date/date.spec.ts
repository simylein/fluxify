import { describe, expect, test } from 'bun:test';
import { expectType } from '../../test/expect-type';
import { Type } from '../parser.type';
import { date } from './date';

describe(date.name, () => {
	test('should have a correct type array', () => {
		expect(date().type).toEqual(['date']);
		expect(date().optional().type).toEqual(['date', 'undefined']);
		expect(date().nullable().optional().type).toEqual(['date', 'null', 'undefined']);
		expect(date().optional().nullable().type).toEqual(['date', 'undefined', 'null']);
		expectType<Type[]>(date().type);
	});

	test('should throw for invalid dates', () => {
		expect(() => date().parse(null)).toThrow(Error('null is not of type string'));
		expect(() => date().parse(undefined)).toThrow(Error('undefined is not of type string'));
		expect(() => date().parse('hello-world')).toThrow(Error('hello-world is not of type date'));
	});

	test('should not throw for valid dates', () => {
		expect(() => date().parse('1970-01-01T00:00:00.000Z')).not.toThrow();
		expect(date().parse('1970-01-01T00:00:00.000Z')).toBeInstanceOf(Date);
		expect(() => date().parse(new Date().getTime())).not.toThrow();
		expect(date().parse(new Date().getTime())).toBeInstanceOf(Date);
		expect(() => date().parse(new Date().toISOString())).not.toThrow();
		expect(date().parse(new Date().toISOString())).toBeInstanceOf(Date);
		expectType<Date>(date().parse('1970-01-01T00:00:00.000Z'));
	});
});
