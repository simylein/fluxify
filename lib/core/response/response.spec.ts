import { afterAll, beforeAll, describe, expect, mock, test } from 'bun:test';
import { randomUUID } from 'crypto';
import { FluxifyRequest } from '../../router/router.type';
import { createResponse, defaultHeaders, header } from './response';

beforeAll(() => {
	console.log = mock(() => void 0);
});

afterAll(() => {
	header({});
});

describe(createResponse.name, () => {
	test('should create a response with null as body if unused', () => {
		const request = new Request('http://example.com') as FluxifyRequest;
		request.id = randomUUID();
		request.time = performance.now();
		request.times = [];
		const status = 200;
		const input = null;
		expect(createResponse(input, status, request)).toBeInstanceOf(Response);
		expect(createResponse(input, status, request).bodyUsed).toEqual(false);
		expect(createResponse(input, status, request).status).toEqual(status);
	});

	test('should create a response with the input as body if used', async () => {
		const request = new Request('http://example.com') as FluxifyRequest;
		request.id = randomUUID();
		request.time = performance.now();
		request.times = [];
		const status = 200;
		const input = { ping: 'pong' };
		expect(createResponse(input, status, request)).toBeInstanceOf(Response);
		expect(createResponse(input, status, request).bodyUsed).toEqual(false);
		expect(createResponse(input, status, request).status).toEqual(status);
		expect(await createResponse(input, status, request).json<typeof input>()).toEqual(input);
	});

	test('should register global headers and return them on every response', () => {
		header({ 'cache-control': 'no-cache' });
		const request = new Request('http://example.com') as FluxifyRequest;
		request.id = randomUUID();
		request.time = performance.now();
		request.times = [];
		expect(Object.fromEntries(createResponse(null, 200, request).headers.entries())).toEqual({
			...defaultHeaders,
			'server-timing': expect.any(String),
			'cache-control': 'no-cache',
		});
	});
});
