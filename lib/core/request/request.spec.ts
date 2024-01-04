import { describe, expect, test } from 'bun:test';
import { ValidationError } from '../../validation/error';
import { parseBody } from './request';

describe(parseBody.name, () => {
	test('should return null if body is unused', async () => {
		const request = new Request('http://example.com');
		expect(await parseBody(request)).toBeNull();
	});

	test('should parse a valid body', async () => {
		const body = { hello: 'world' };
		const request = new Request('http://example.com', { body: JSON.stringify(body) });
		expect(await parseBody(request)).toEqual(body);
	});

	test('should throw for an invalid body', () => {
		const request = new Request('http://example.com', { body: 'invalid-json' });
		expect(async () => {
			await parseBody(request);
		}).toThrow(new ValidationError('JSON Parse error: Unexpected identifier "invalid"'));
	});
});
