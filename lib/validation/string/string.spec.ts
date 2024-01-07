import { describe, expect, test } from 'bun:test';
import { expectType } from '../../test/expect-type';
import { Type } from '../parser.type';
import { string } from './string';

describe(string.name, () => {
	test('should have a correct type array', () => {
		expect(string().type).toEqual(['string']);
		expect(string().optional().type).toEqual(['string', 'undefined']);
		expect(string().nullable().optional().type).toEqual(['string', 'null', 'undefined']);
		expect(string().optional().nullable().type).toEqual(['string', 'undefined', 'null']);
		expectType<Type[]>(string().type);
	});

	test('should return a string if passed a string and else throw', () => {
		expect(() => string().parse('hello-world')).not.toThrow();
		expect(string().parse('hello-world')).toEqual('hello-world');
		expect(() => string().parse(42)).toThrow();
		expect(() => string().parse(true)).toThrow();
		expect(() => string().parse({})).toThrow();
		expect(() => string().parse([])).toThrow();
		expect(() => string().parse(undefined)).toThrow();
		expect(() => string().parse(null)).toThrow();
		expectType<string>(string().parse('hello-world'));
	});

	test('should return a string if it matches the regex and else throw', () => {
		const regex = /\d{4}-\d{2}-\d{2}/;
		expect(() => string().matches(regex).parse('1970-01-01')).not.toThrow();
		expect(string().matches(regex).parse('1970-01-01')).toEqual('1970-01-01');
		expect(() => string().matches(regex).parse('42')).toThrow();
		expect(() => string().matches(regex).parse(42)).toThrow();
		expect(() => string().matches(regex).parse(true)).toThrow();
		expect(() => string().matches(regex).parse({})).toThrow();
		expect(() => string().matches(regex).parse([])).toThrow();
		expect(() => string().matches(regex).parse(undefined)).toThrow();
		expect(() => string().matches(regex).parse(null)).toThrow();
		expectType<string>(string().matches(regex).parse('1970-01-01'));
	});

	test('should respect the minimum value and else throw', () => {
		expect(() => string().min(4).parse('hello')).not.toThrow();
		expect(() => string().min(5).parse('hello')).not.toThrow();
		expect(() => string().min(6).parse('hello')).toThrow();
		expectType<string>(string().min(4).parse('hello'));
	});

	test('should respect the maximum value and else throw', () => {
		expect(() => string().max(10).parse('hello-world')).toThrow();
		expect(() => string().max(11).parse('hello-world')).not.toThrow();
		expect(() => string().max(12).parse('hello-world')).not.toThrow();
		expectType<string>(string().max(12).parse('hello-world'));
	});

	test('should return a string or undefined if passed a string or undefined and else throw', () => {
		expect(() => string().optional().parse('hello-world')).not.toThrow();
		expect(string().optional().parse('hello-world')).toEqual('hello-world');
		expect(() => string().optional().parse(42)).toThrow();
		expect(() => string().optional().parse(true)).toThrow();
		expect(() => string().optional().parse({})).toThrow();
		expect(() => string().optional().parse([])).toThrow();
		expect(() => string().optional().parse(undefined)).not.toThrow();
		expect(string().optional().parse(undefined)).toBeUndefined();
		expect(() => string().optional().parse(null)).toThrow();
		expectType<string | undefined>(string().optional().parse('hello-world'));
	});

	test('should return a string or the default value if passed a string or undefined', () => {
		expect(() => string().optional().default('hello').parse('hello-world')).not.toThrow();
		expect(string().optional().default('hello').parse('hello-world')).toEqual('hello-world');
		expect(() => string().optional().default('hello').parse(42)).toThrow();
		expect(() => string().optional().default('hello').parse(true)).toThrow();
		expect(() => string().optional().default('hello').parse({})).toThrow();
		expect(() => string().optional().default('hello').parse([])).toThrow();
		expect(() => string().optional().default('hello').parse(undefined)).not.toThrow();
		expect(string().optional().default('hello').parse(undefined)).toEqual('hello');
		expect(() => string().optional().default('hello').parse(null)).toThrow();
		expectType<string>(string().optional().default('hello').parse('hello-world'));
	});

	test('should return a string undefined or null if passed a string undefined or null and else throw', () => {
		expect(() => string().optional().nullable().parse('hello-world')).not.toThrow();
		expect(string().optional().nullable().parse('hello-world')).toEqual('hello-world');
		expect(() => string().optional().nullable().parse(42)).toThrow();
		expect(() => string().optional().nullable().parse(true)).toThrow();
		expect(() => string().optional().nullable().parse({})).toThrow();
		expect(() => string().optional().nullable().parse([])).toThrow();
		expect(() => string().optional().nullable().parse(undefined)).not.toThrow();
		expect(string().optional().nullable().parse(undefined)).toBeUndefined();
		expect(() => string().optional().nullable().parse(null)).not.toThrow();
		expect(string().optional().nullable().parse(null)).toBeNull();
		expectType<string | undefined | null>(string().optional().nullable().parse('hello-world'));
	});

	test('should return a string null or undefined if passed a string null or undefined and else throw', () => {
		expect(() => string().nullable().optional().parse('hello-world')).not.toThrow();
		expect(string().nullable().optional().parse('hello-world')).toEqual('hello-world');
		expect(() => string().nullable().optional().parse(42)).toThrow();
		expect(() => string().nullable().optional().parse(true)).toThrow();
		expect(() => string().nullable().optional().parse({})).toThrow();
		expect(() => string().nullable().optional().parse([])).toThrow();
		expect(() => string().nullable().optional().parse(undefined)).not.toThrow();
		expect(string().nullable().optional().parse(undefined)).toBeUndefined();
		expect(() => string().nullable().optional().parse(null)).not.toThrow();
		expect(string().nullable().optional().parse(null)).toBeNull();
		expectType<string | undefined | null>(string().nullable().optional().parse('hello-world'));
	});
});
