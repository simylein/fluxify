import { describe, expect, test } from 'bun:test';
import { expectType } from '../../test/expect-type';
import { words } from './words';

describe(words.name, () => {
	test('should return the given amount of random words', () => {
		expect(words(4).split(' ')).toHaveLength(4);
		expect(words(8).split(' ')).toHaveLength(8);
		expect(words(12).split(' ')).toHaveLength(12);
		expect(words(16).split(' ')).toHaveLength(16);
		expect(words(20).split(' ')).toHaveLength(20);
		expect(words(24).split(' ')).toHaveLength(24);
	});

	test('should always return a string type', () => {
		expect(words(4)).toBeTypeOf('string');
		expect(words(8)).toBeTypeOf('string');
		expect(words(12)).toBeTypeOf('string');
		expect(words(16)).toBeTypeOf('string');
		expect(words(20)).toBeTypeOf('string');
		expect(words(24)).toBeTypeOf('string');
	});

	expectType<string>(words(24));
});
