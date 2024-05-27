import { describe, expect, test } from 'bun:test';
import { expectType } from '../../test/expect-type';
import { Type } from '../parser.type';
import { blob } from './blob';

describe(blob.name, () => {
	test('should have a correct type array', () => {
		expect(blob('image').type).toEqual(['blob']);
		expect(blob('image').optional().type).toEqual(['blob', 'undefined']);
		expect(blob('image').nullable().optional().type).toEqual(['blob', 'null', 'undefined']);
		expect(blob('image').optional().nullable().type).toEqual(['blob', 'undefined', 'null']);
		expectType<Type[]>(blob('image').type);
	});

	test('should return a blob if passed a blob and else throw', () => {
		expect(() => blob('image').parse('hello-world')).toThrow();
		expect(() => blob('image').parse(42)).toThrow();
		expect(() => blob('image').parse(true)).toThrow();
		expect(() => blob('image').parse({})).toThrow();
		expect(() => blob('image').parse([])).toThrow();
		expect(() => blob('image').parse(undefined)).toThrow();
		expect(() => blob('image').parse(null)).toThrow();
		expect(() => blob('image').parse(new Blob([], { type: 'image' }))).not.toThrow();
		expect(blob('image').parse(new Blob([], { type: 'image' }))).toEqual(new Blob([], { type: 'image' }) as Blob);
		expectType<Blob>(blob('image').parse(new Blob([], { type: 'image' })));
	});

	test('should return a blob when type matches and else throw', () => {
		expect(() => blob('image').parse(new Blob([]))).toThrow();
		expect(() => blob('image').parse(new Blob([], { type: '' }))).toThrow();
		expect(() => blob('image').parse(new Blob([], { type: 'non-image' }))).toThrow();
		expect(() => blob('image').parse(new Blob([], { type: 'image' }))).not.toThrow();
		expectType<Blob>(blob('image').parse(new Blob([], { type: 'image' })));
	});

	test('should respect the minimum value and else throw', () => {
		const image = new Blob(['4--b'], { type: 'image' });
		expect(() => blob('image').min(3).parse(image)).not.toThrow();
		expect(() => blob('image').min(4).parse(image)).not.toThrow();
		expect(() => blob('image').min(5).parse(image)).toThrow();
		expectType<Blob>(blob('image').min(3).parse(image));
	});

	test('should respect the maximum value and else throw', () => {
		const image = new Blob(['8--bytes'], { type: 'image' });
		expect(() => blob('image').max(7).parse(image)).toThrow();
		expect(() => blob('image').max(8).parse(image)).not.toThrow();
		expect(() => blob('image').max(9).parse(image)).not.toThrow();
		expectType<Blob>(blob('image').max(9).parse(image));
	});

	test('should return a blob or undefined if passed a blob or undefined and else throw', () => {
		const image = new Blob([], { type: 'image' });
		expect(() => blob('image').optional().parse('hello-world')).toThrow();
		expect(() => blob('image').optional().parse(42)).toThrow();
		expect(() => blob('image').optional().parse(true)).toThrow();
		expect(() => blob('image').optional().parse({})).toThrow();
		expect(() => blob('image').optional().parse([])).toThrow();
		expect(() => blob('image').optional().parse(undefined)).not.toThrow();
		expect(blob('image').optional().parse(undefined)).toBeUndefined();
		expect(() => blob('image').optional().parse(null)).toThrow();
		expect(blob('image').optional().parse(image)).toEqual(image as Blob);
		expectType<Blob | undefined>(blob('image').optional().parse(image));
	});

	test('should return a blob undefined or null if passed a blob undefined or null and else throw', () => {
		const image = new Blob([], { type: 'image' });
		expect(() => blob('image').optional().nullable().parse('hello-world')).toThrow();
		expect(() => blob('image').optional().nullable().parse(42)).toThrow();
		expect(() => blob('image').optional().nullable().parse(true)).toThrow();
		expect(() => blob('image').optional().nullable().parse({})).toThrow();
		expect(() => blob('image').optional().nullable().parse([])).toThrow();
		expect(() => blob('image').optional().nullable().parse(undefined)).not.toThrow();
		expect(blob('image').optional().nullable().parse(undefined)).toBeUndefined();
		expect(() => blob('image').optional().nullable().parse(null)).not.toThrow();
		expect(blob('image').optional().nullable().parse(null)).toBeNull();
		expect(blob('image').optional().nullable().parse(image)).toEqual(image as Blob);
		expectType<Blob | undefined | null>(blob('image').optional().nullable().parse(image));
	});

	test('should return a blob null or undefined if passed a blob null or undefined and else throw', () => {
		const image = new Blob([], { type: 'image' });
		expect(() => blob('image').nullable().optional().parse('hello-world')).toThrow();
		expect(() => blob('image').nullable().optional().parse(42)).toThrow();
		expect(() => blob('image').nullable().optional().parse(true)).toThrow();
		expect(() => blob('image').nullable().optional().parse({})).toThrow();
		expect(() => blob('image').nullable().optional().parse([])).toThrow();
		expect(() => blob('image').nullable().optional().parse(undefined)).not.toThrow();
		expect(blob('image').nullable().optional().parse(undefined)).toBeUndefined();
		expect(() => blob('image').nullable().optional().parse(null)).not.toThrow();
		expect(blob('image').nullable().optional().parse(null)).toBeNull();
		expect(blob('image').nullable().optional().parse(image)).toEqual(image as Blob);
		expectType<Blob | undefined | null>(blob('image').nullable().optional().parse(image));
	});
});
