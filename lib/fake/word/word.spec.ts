import { describe, expect, test } from 'bun:test';
import { word } from './word';

describe(word.name, () => {
	test('should return a random word with given length', () => {
		expect(word(2)).toHaveLength(2);
		expect(word(4)).toHaveLength(4);
		expect(word(6)).toHaveLength(6);
		expect(word(8)).toHaveLength(8);
		expect(word(10)).toHaveLength(10);
		expect(word(12)).toHaveLength(12);
	});

	test('should always return a string type', () => {
		expect(word(2)).toBeTypeOf('string');
		expect(word(4)).toBeTypeOf('string');
		expect(word(6)).toBeTypeOf('string');
		expect(word(8)).toBeTypeOf('string');
		expect(word(10)).toBeTypeOf('string');
		expect(word(12)).toBeTypeOf('string');
	});
});
