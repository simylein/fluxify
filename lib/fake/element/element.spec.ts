import { describe, expect, test } from 'bun:test';
import { expectType } from '../../test/expect-type';
import { data, element, elements } from './element';

describe('data', () => {
	test('should contain one hundred and eighteen periodic elements', () => {
		expect(data).toBeArrayOfSize(118);
	});
});

describe(element.name, () => {
	test('should return a random periodic element', () => {
		expect(element()).toBeOneOf(data);
		expect(element()).toBeOneOf(data);
	});

	expectType<string>(element());
});

describe(elements.name, () => {
	test('should return specified amount of random periodic elements', () => {
		expect(elements(2)).toBeArrayOfSize(2);
		expect(elements(4)).toBeArrayOfSize(4);
		expect(elements(2)[0]).toBeOneOf(data);
		expect(elements(4)[2]).toBeOneOf(data);
	});

	expectType<string[]>(elements(2));
});
