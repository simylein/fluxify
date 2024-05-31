import { describe, expect, test } from 'bun:test';
import { expectType } from '../../test/expect-type';
import { data, excuse, excuses } from './excuse';

describe('data', () => {
	test('should contain one hundred and forty five developer excuses', () => {
		expect(data).toBeArrayOfSize(145);
	});
});

describe(excuse.name, () => {
	test('should return a random developer excuse', () => {
		expect(excuse()).toBeOneOf(data);
		expect(excuse()).toBeOneOf(data);
	});

	expectType<string>(excuse());
});

describe(excuses.name, () => {
	test('should return specified amount of random developer excuses', () => {
		expect(excuses(2)).toBeArrayOfSize(2);
		expect(excuses(4)).toBeArrayOfSize(4);
		expect(excuses(2)[0]).toBeOneOf(data);
		expect(excuses(4)[2]).toBeOneOf(data);
	});

	expectType<string[]>(excuses(2));
});
