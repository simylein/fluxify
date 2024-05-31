import { describe, expect, test } from 'bun:test';
import { expectType } from '../../test/expect-type';
import { data, product, products } from './product';

describe('data', () => {
	test('should contain twenty four products', () => {
		expect(data).toBeArrayOfSize(24);
	});
});

describe(product.name, () => {
	test('should return a random product', () => {
		expect(product()).toBeOneOf(data);
		expect(product()).toBeOneOf(data);
	});

	expectType<string>(product());
});

describe(products.name, () => {
	test('should return specified amount of random products', () => {
		expect(products(2)).toBeArrayOfSize(2);
		expect(products(4)).toBeArrayOfSize(4);
		expect(products(2)[0]).toBeOneOf(data);
		expect(products(4)[2]).toBeOneOf(data);
	});

	expectType<string[]>(products(2));
});
