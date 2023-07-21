import { describe, expect, test } from 'bun:test';
import { expectType } from '../../test/expect-type';
import { Type } from '../parser.type';
import { number } from './number';

describe(number.name, () => {
	test('should have a correct type array', () => {
		expect(number().type).toEqual(['number']);
		expect(number().optional().type).toEqual(['number', 'undefined']);
		expect(number().nullable().optional().type).toEqual(['number', 'null', 'undefined']);
		expect(number().optional().nullable().type).toEqual(['number', 'undefined', 'null']);
		expectType<Type[]>(number().type);
	});

	test('should return a number if passed a number and else throw', () => {
		expect(() => number().parse('hello-world')).toThrow();
		expect(() => number().parse(42)).not.toThrow();
		expect(number().parse(42)).toEqual(42);
		expect(() => number().parse(true)).toThrow();
		expect(() => number().parse({})).toThrow();
		expect(() => number().parse([])).toThrow();
		expect(() => number().parse(undefined)).toThrow();
		expect(() => number().parse(null)).toThrow();
		expectType<number>(number().parse(42));
	});

	test('should respect the minimum value and else throw', () => {
		expect(() => number().min(3).parse(4)).not.toThrow();
		expect(() => number().min(4).parse(4)).not.toThrow();
		expect(() => number().min(5).parse(4)).toThrow();
		expectType<number>(number().min(3).parse(4));
	});

	test('should respect the maximum value and else throw', () => {
		expect(() => number().max(7).parse(8)).toThrow();
		expect(() => number().max(8).parse(8)).not.toThrow();
		expect(() => number().max(9).parse(8)).not.toThrow();
		expectType<number>(number().max(9).parse(8));
	});

	test('should return a number if passed a number or a number as string and else throw', () => {
		expect(() => number().transform().parse('hello-world')).toThrow();
		expect(() => number().transform().parse('42')).not.toThrow();
		expect(number().transform().parse('42')).toEqual(42);
		expect(() => number().transform().parse(42)).not.toThrow();
		expect(number().transform().parse(42)).toEqual(42);
		expect(() => number().transform().parse(true)).toThrow();
		expect(() => number().transform().parse({})).toThrow();
		expect(() => number().transform().parse([])).toThrow();
		expect(() => number().transform().parse(undefined)).toThrow();
		expect(() => number().transform().parse(null)).toThrow();
		expectType<number>(number().transform().parse('42'));
	});

	test('should return a number or undefined if passed a number or undefined and else throw', () => {
		expect(() => number().optional().parse('hello-world')).toThrow();
		expect(() => number().optional().parse(42)).not.toThrow();
		expect(number().optional().parse(42)).toEqual(42);
		expect(() => number().optional().parse(true)).toThrow();
		expect(() => number().optional().parse({})).toThrow();
		expect(() => number().optional().parse([])).toThrow();
		expect(() => number().optional().parse(undefined)).not.toThrow();
		expect(number().optional().parse(undefined)).toEqual(undefined);
		expect(() => number().optional().parse(null)).toThrow();
		expectType<number | undefined>(number().optional().parse(42));
	});

	test('should return a number or the default value if passed a number or undefined', () => {
		expect(() => number().optional().default(73).parse('hello-world')).toThrow();
		expect(() => number().optional().default(73).parse(42)).not.toThrow();
		expect(number().optional().default(73).parse(42)).toEqual(42);
		expect(() => number().optional().default(73).parse(true)).toThrow();
		expect(() => number().optional().default(73).parse({})).toThrow();
		expect(() => number().optional().default(73).parse([])).toThrow();
		expect(() => number().optional().default(73).parse(undefined)).not.toThrow();
		expect(number().optional().default(73).parse(undefined)).toEqual(73);
		expect(() => number().optional().default(73).parse(null)).toThrow();
		expectType<number>(number().optional().default(73).parse(42));
	});

	test('should return a number undefined or null if passed a number undefined or null and else throw', () => {
		expect(() => number().optional().nullable().parse('hello-world')).toThrow();
		expect(() => number().optional().nullable().parse(42)).not.toThrow();
		expect(number().optional().nullable().parse(42)).toEqual(42);
		expect(() => number().optional().nullable().parse(true)).toThrow();
		expect(() => number().optional().nullable().parse({})).toThrow();
		expect(() => number().optional().nullable().parse([])).toThrow();
		expect(() => number().optional().nullable().parse(undefined)).not.toThrow();
		expect(number().optional().nullable().parse(undefined)).toEqual(undefined);
		expect(() => number().optional().nullable().parse(null)).not.toThrow();
		expect(number().optional().nullable().parse(null)).toEqual(null);
		expectType<number | undefined | null>(number().optional().nullable().parse(42));
	});

	test('should return a number null or undefined if passed a number null or undefined and else throw', () => {
		expect(() => number().nullable().optional().parse('hello-world')).toThrow();
		expect(() => number().nullable().optional().parse(42)).not.toThrow();
		expect(number().nullable().optional().parse(42)).toEqual(42);
		expect(() => number().nullable().optional().parse(true)).toThrow();
		expect(() => number().nullable().optional().parse({})).toThrow();
		expect(() => number().nullable().optional().parse([])).toThrow();
		expect(() => number().nullable().optional().parse(undefined)).not.toThrow();
		expect(number().nullable().optional().parse(undefined)).toEqual(undefined);
		expect(() => number().nullable().optional().parse(null)).not.toThrow();
		expect(number().nullable().optional().parse(null)).toEqual(null);
		expectType<number | undefined | null>(number().nullable().optional().parse(42));
	});
});
