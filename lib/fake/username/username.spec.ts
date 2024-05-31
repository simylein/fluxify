import { describe, expect, test } from 'bun:test';
import { expectType } from '../../test/expect-type';
import { data, username, usernames } from './username';

describe('data', () => {
	test('should contain fifty two usernames', () => {
		expect(data).toBeArrayOfSize(52);
	});
});

describe(username.name, () => {
	test('should return a random username', () => {
		expect(username()).toBeOneOf(data);
		expect(username()).toBeOneOf(data);
	});

	expectType<string>(username());
});

describe(usernames.name, () => {
	test('should return specified amount of random usernames', () => {
		expect(usernames(2)).toBeArrayOfSize(2);
		expect(usernames(4)).toBeArrayOfSize(4);
		expect(usernames(2)[0]).toBeOneOf(data);
		expect(usernames(4)[2]).toBeOneOf(data);
	});

	expectType<string[]>(usernames(2));
});
