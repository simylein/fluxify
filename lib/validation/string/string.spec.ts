import { describe, expect, test } from 'bun:test';
import { string } from './string';

describe(string.name, () => {
	test('should have a correct type array', () => {
		expect(string().type).toEqual(['string']);
		expect(string().optional().type).toEqual(['string', 'undefined']);
		expect(string().nullable().optional().type).toEqual(['string', 'null', 'undefined']);
		expect(string().optional().nullable().type).toEqual(['string', 'undefined', 'null']);
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
	});

	test('should respect the minimum value and else throw', () => {
		expect(() => string().min(4).parse('hello')).not.toThrow();
		expect(() => string().min(5).parse('hello')).not.toThrow();
		expect(() => string().min(6).parse('hello')).toThrow();
	});

	test('should respect the maximum value and else throw', () => {
		expect(() => string().max(10).parse('hello-world')).toThrow();
		expect(() => string().max(11).parse('hello-world')).not.toThrow();
		expect(() => string().max(12).parse('hello-world')).not.toThrow();
	});

	test('should return a string or undefined if passed a string or undefined and else throw', () => {
		expect(() => string().optional().parse('hello-world')).not.toThrow();
		expect(string().optional().parse('hello-world')).toEqual('hello-world');
		expect(() => string().optional().parse(42)).toThrow();
		expect(() => string().optional().parse(true)).toThrow();
		expect(() => string().optional().parse({})).toThrow();
		expect(() => string().optional().parse([])).toThrow();
		expect(() => string().optional().parse(undefined)).not.toThrow();
		expect(string().optional().parse(undefined)).toEqual(undefined);
		expect(() => string().optional().parse(null)).toThrow();
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
	});

	test('should return a string undefined or null if passed a string undefined or null and else throw', () => {
		expect(() => string().optional().nullable().parse('hello-world')).not.toThrow();
		expect(string().optional().nullable().parse('hello-world')).toEqual('hello-world');
		expect(() => string().optional().nullable().parse(42)).toThrow();
		expect(() => string().optional().nullable().parse(true)).toThrow();
		expect(() => string().optional().nullable().parse({})).toThrow();
		expect(() => string().optional().nullable().parse([])).toThrow();
		expect(() => string().optional().nullable().parse(undefined)).not.toThrow();
		expect(string().optional().nullable().parse(undefined)).toEqual(undefined);
		expect(() => string().optional().nullable().parse(null)).not.toThrow();
		expect(string().optional().nullable().parse(null)).toEqual(null);
	});

	test('should return a string null or undefined if passed a string null or undefined and else throw', () => {
		expect(() => string().nullable().optional().parse('hello-world')).not.toThrow();
		expect(string().nullable().optional().parse('hello-world')).toEqual('hello-world');
		expect(() => string().nullable().optional().parse(42)).toThrow();
		expect(() => string().nullable().optional().parse(true)).toThrow();
		expect(() => string().nullable().optional().parse({})).toThrow();
		expect(() => string().nullable().optional().parse([])).toThrow();
		expect(() => string().nullable().optional().parse(undefined)).not.toThrow();
		expect(string().nullable().optional().parse(undefined)).toEqual(undefined);
		expect(() => string().nullable().optional().parse(null)).not.toThrow();
		expect(string().nullable().optional().parse(null)).toEqual(null);
	});
});
