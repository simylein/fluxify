import { describe, expect, test } from 'bun:test';
import { expectType } from '../../test/expect-type';
import { data, quote, quotes } from './quote';

describe('data', () => {
	test('should contain one hundred and thirty quotes', () => {
		expect(data).toBeArrayOfSize(130);
	});
});

describe(quote.name, () => {
	test('should return a random quote', () => {
		expect(quote()).toBeOneOf(data);
		expect(quote()).toBeOneOf(data);
	});

	expectType<string>(quote());
});

describe(quotes.name, () => {
	test('should return specified amount of random quotes', () => {
		expect(quotes(2)).toBeArrayOfSize(2);
		expect(quotes(4)).toBeArrayOfSize(4);
		expect(quotes(2)[0]).toBeOneOf(data);
		expect(quotes(4)[2]).toBeOneOf(data);
	});

	expectType<string[]>(quotes(2));
});
