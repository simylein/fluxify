import { beforeAll, describe, expect, mock, test } from 'bun:test';
import { randomUUID } from 'crypto';
import { createResponse } from './response';

beforeAll(() => {
	console.log = mock(() => void 0);
});

describe(createResponse.name, () => {
	test('should create a response with null as body if unused', () => {
		const request = new Request('http://example.com') as Request & { id: string; time: number };
		request.id = randomUUID();
		request.time = performance.now();
		const status = 200;
		const input = null;
		expect(createResponse(input, status, request)).toBeInstanceOf(Response);
		expect(createResponse(input, status, request).bodyUsed).toEqual(false);
		expect(createResponse(input, status, request).status).toEqual(status);
	});

	test('should create a response with the input as body if used', async () => {
		const request = new Request('http://example.com') as Request & { id: string; time: number };
		request.id = randomUUID();
		request.time = performance.now();
		const status = 200;
		const input = { ping: 'pong' };
		expect(createResponse(input, status, request)).toBeInstanceOf(Response);
		expect(createResponse(input, status, request).bodyUsed).toEqual(false);
		expect(createResponse(input, status, request).status).toEqual(status);
		expect(await createResponse(input, status, request).json()).toEqual(input);
	});
});
