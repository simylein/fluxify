import { describe, expect, test } from 'bun:test';
import { expectType } from '../../test/expect-type';
import { adjective, adjectives, data } from './adjective';

describe('data', () => {
	test('should contain twenty four adjectives', () => {
		expect(data).toBeArrayOfSize(24);
	});
});

describe(adjective.name, () => {
	test('should return a random adjective', () => {
		expect(adjective()).toBeOneOf(data);
		expect(adjective()).toBeOneOf(data);
	});

	expectType<string>(adjective());
});

describe(adjectives.name, () => {
	test('should return specified amount of random adjectives', () => {
		expect(adjectives(2)).toBeArrayOfSize(2);
		expect(adjectives(4)).toBeArrayOfSize(4);
		expect(adjectives(2)[0]).toBeOneOf(data);
		expect(adjectives(4)[2]).toBeOneOf(data);
	});

	expectType<string[]>(adjectives(2));
});
