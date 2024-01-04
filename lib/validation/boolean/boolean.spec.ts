import { describe, expect, test } from 'bun:test';
import { expectType } from '../../test/expect-type';
import { Type } from '../parser.type';
import { boolean } from './boolean';

describe(boolean.name, () => {
	test('should have a correct type array', () => {
		expect(boolean().type).toEqual(['boolean']);
		expect(boolean().optional().type).toEqual(['boolean', 'undefined']);
		expect(boolean().nullable().optional().type).toEqual(['boolean', 'null', 'undefined']);
		expect(boolean().optional().nullable().type).toEqual(['boolean', 'undefined', 'null']);
		expectType<Type[]>(boolean().type);
	});

	test('should return a boolean if passed a boolean and else throw', () => {
		expect(() => boolean().parse('hello-world')).toThrow();
		expect(() => boolean().parse(42)).toThrow();
		expect(() => boolean().parse(true)).not.toThrow();
		expect(boolean().parse(true)).toEqual(true);
		expect(() => boolean().parse({})).toThrow();
		expect(() => boolean().parse([])).toThrow();
		expect(() => boolean().parse(undefined)).toThrow();
		expect(() => boolean().parse(null)).toThrow();
		expectType<boolean>(boolean().parse(true));
	});

	test('should return a boolean if passed a boolean or a boolean as string and else throw', () => {
		expect(() => boolean().transform().parse('hello-world')).toThrow();
		expect(() => boolean().transform().parse('true')).not.toThrow();
		expect(boolean().transform().parse('true')).toEqual(true);
		expect(() => boolean().transform().parse(42)).toThrow();
		expect(() => boolean().transform().parse(true)).not.toThrow();
		expect(boolean().transform().parse(true)).toEqual(true);
		expect(() => boolean().transform().parse({})).toThrow();
		expect(() => boolean().transform().parse([])).toThrow();
		expect(() => boolean().transform().parse(undefined)).toThrow();
		expect(() => boolean().transform().parse(null)).toThrow();
		expectType<boolean>(boolean().transform().parse('true'));
	});

	test('should return a boolean or undefined if passed a boolean or undefined and else throw', () => {
		expect(() => boolean().optional().parse('hello-world')).toThrow();
		expect(() => boolean().optional().parse(42)).toThrow();
		expect(() => boolean().optional().parse(true)).not.toThrow();
		expect(boolean().optional().parse(true)).toEqual(true);
		expect(() => boolean().optional().parse({})).toThrow();
		expect(() => boolean().optional().parse([])).toThrow();
		expect(() => boolean().optional().parse(undefined)).not.toThrow();
		expect(boolean().optional().parse(undefined)).toBeUndefined();
		expect(() => boolean().optional().parse(null)).toThrow();
		expectType<boolean | undefined>(boolean().optional().parse(true));
	});

	test('should return a boolean or the default value if passed a boolean or undefined', () => {
		expect(() => boolean().optional().default(false).parse('hello-world')).toThrow();
		expect(() => boolean().optional().default(false).parse(42)).toThrow();
		expect(() => boolean().optional().default(false).parse(true)).not.toThrow();
		expect(boolean().optional().default(false).parse(true)).toEqual(true);
		expect(() => boolean().optional().default(false).parse({})).toThrow();
		expect(() => boolean().optional().default(false).parse([])).toThrow();
		expect(() => boolean().optional().default(false).parse(undefined)).not.toThrow();
		expect(boolean().optional().default(false).parse(undefined)).toEqual(false);
		expect(() => boolean().optional().default(false).parse(null)).toThrow();
		expectType<boolean>(boolean().optional().default(false).parse(true));
	});

	test('should return a boolean undefined or null if passed a boolean undefined or null and else throw', () => {
		expect(() => boolean().optional().nullable().parse('hello-world')).toThrow();
		expect(() => boolean().optional().nullable().parse(42)).toThrow();
		expect(() => boolean().optional().nullable().parse(true)).not.toThrow();
		expect(boolean().optional().nullable().parse(true)).toEqual(true);
		expect(() => boolean().optional().nullable().parse({})).toThrow();
		expect(() => boolean().optional().nullable().parse([])).toThrow();
		expect(() => boolean().optional().nullable().parse(undefined)).not.toThrow();
		expect(boolean().optional().nullable().parse(undefined)).toBeUndefined();
		expect(() => boolean().optional().nullable().parse(null)).not.toThrow();
		expect(boolean().optional().nullable().parse(null)).toBeNull();
		expectType<boolean | undefined | null>(boolean().optional().nullable().parse(true));
	});

	test('should return a boolean null or undefined if passed a boolean null or undefined and else throw', () => {
		expect(() => boolean().nullable().optional().parse('hello-world')).toThrow();
		expect(() => boolean().nullable().optional().parse(42)).toThrow();
		expect(() => boolean().nullable().optional().parse(true)).not.toThrow();
		expect(boolean().nullable().optional().parse(true)).toEqual(true);
		expect(() => boolean().nullable().optional().parse({})).toThrow();
		expect(() => boolean().nullable().optional().parse([])).toThrow();
		expect(() => boolean().nullable().optional().parse(undefined)).not.toThrow();
		expect(boolean().nullable().optional().parse(undefined)).toBeUndefined();
		expect(() => boolean().nullable().optional().parse(null)).not.toThrow();
		expect(boolean().nullable().optional().parse(null)).toBeNull();
		expectType<boolean | undefined | null>(boolean().nullable().optional().parse(true));
	});
});
