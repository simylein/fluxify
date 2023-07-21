import { describe, expect, test } from 'bun:test';
import { expectType } from '../../test/expect-type';
import { Type } from '../parser.type';
import { union } from './union';

describe(union.name, () => {
	test('should have a correct type array', () => {
		expect(union([]).type).toEqual(['union']);
		expect(union([]).optional().type).toEqual(['union', 'undefined']);
		expect(union([]).nullable().optional().type).toEqual(['union', 'null', 'undefined']);
		expect(union([]).optional().nullable().type).toEqual(['union', 'undefined', 'null']);
		expectType<Type[]>(union([]).type);
	});

	test('should return the value if included in the union type', () => {
		expect(() => union(['light', 'dark', 'auto']).parse('dark')).not.toThrow();
		expect(union(['light', 'dark', 'auto']).parse('dark')).toEqual('dark');
		expect(() => union(['light', 'dark', 'auto']).parse('hello-world')).toThrow();
		expect(() => union(['light', 'dark', 'auto']).parse(42)).toThrow();
		expect(() => union(['light', 'dark', 'auto']).parse(true)).toThrow();
		expect(() => union(['light', 'dark', 'auto']).parse({})).toThrow();
		expect(() => union(['light', 'dark', 'auto']).parse([])).toThrow();
		expect(() => union(['light', 'dark', 'auto']).parse(undefined)).toThrow();
		expect(() => union(['light', 'dark', 'auto']).parse(null)).toThrow();
		expectType<'light' | 'dark' | 'auto'>(union(['light', 'dark', 'auto']).parse('dark'));
	});

	test('should return the value if included in the union type or undefined and else throw', () => {
		expect(() => union(['light', 'dark', 'auto']).optional().parse('dark')).not.toThrow();
		expect(union(['light', 'dark', 'auto']).optional().parse('dark')).toEqual('dark');
		expect(() => union(['light', 'dark', 'auto']).optional().parse(42)).toThrow();
		expect(() => union(['light', 'dark', 'auto']).optional().parse(true)).toThrow();
		expect(() => union(['light', 'dark', 'auto']).optional().parse({})).toThrow();
		expect(() => union(['light', 'dark', 'auto']).optional().parse([])).toThrow();
		expect(() => union(['light', 'dark', 'auto']).optional().parse(undefined)).not.toThrow();
		expect(union(['light', 'dark', 'auto']).optional().parse(undefined)).toEqual(undefined);
		expect(() => union(['light', 'dark', 'auto']).optional().parse(null)).toThrow();
		expectType<'light' | 'dark' | 'auto' | undefined>(union(['light', 'dark', 'auto']).optional().parse('dark'));
	});
});
