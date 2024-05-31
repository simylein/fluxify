import { describe, expect, test } from 'bun:test';
import { expectType } from '../../test/expect-type';
import { data, email, emails } from './email';

describe('data', () => {
	test('should contain twenty four emails', () => {
		expect(data).toBeArrayOfSize(24);
	});
});

describe(email.name, () => {
	test('should return a random email', () => {
		expect(email()).toBeOneOf(data);
		expect(email()).toBeOneOf(data);
	});

	expectType<string>(email());
});

describe(emails.name, () => {
	test('should return specified amount of random emails', () => {
		expect(emails(2)).toBeArrayOfSize(2);
		expect(emails(4)).toBeArrayOfSize(4);
		expect(emails(2)[0]).toBeOneOf(data);
		expect(emails(4)[2]).toBeOneOf(data);
	});

	expectType<string[]>(emails(2));
});
