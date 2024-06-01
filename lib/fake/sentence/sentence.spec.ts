import { describe, expect, test } from 'bun:test';
import { expectType } from '../../test/expect-type';
import { data, sentence, sentences } from './sentence';

describe('data', () => {
	test('should contain one hundred and forty four sentences', () => {
		expect(data).toBeArrayOfSize(144);
	});
});

describe(sentence.name, () => {
	test('should return a random sentence', () => {
		expect(sentence()).toBeOneOf(data);
		expect(sentence()).toBeOneOf(data);
	});

	expectType<string>(sentence());
});

describe(sentences.name, () => {
	test('should return specified amount of random sentences', () => {
		expect(sentences(2)).toBeArrayOfSize(2);
		expect(sentences(4)).toBeArrayOfSize(4);
		expect(sentences(2)[0]).toBeOneOf(data);
		expect(sentences(4)[2]).toBeOneOf(data);
	});

	expectType<string[]>(sentences(2));
});
