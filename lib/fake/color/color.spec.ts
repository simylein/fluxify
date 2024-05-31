import { describe, expect, test } from 'bun:test';
import { expectType } from '../../test/expect-type';
import { color, colors, data } from './color';

describe('data', () => {
	test('should contain twenty two colors', () => {
		expect(data).toBeArrayOfSize(22);
	});
});

describe(color.name, () => {
	test('should return a random adjective', () => {
		expect(color()).toBeOneOf(data);
		expect(color()).toBeOneOf(data);
	});

	expectType<string>(color());
});

describe(colors.name, () => {
	test('should return specified amount of random colors', () => {
		expect(colors(2)).toBeArrayOfSize(2);
		expect(colors(4)).toBeArrayOfSize(4);
		expect(colors(2)[0]).toBeOneOf(data);
		expect(colors(4)[2]).toBeOneOf(data);
	});

	expectType<string[]>(colors(2));
});
