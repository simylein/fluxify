import { beforeAll, describe, expect, mock, test } from 'bun:test';
import { createResponse } from './response';

beforeAll(() => {
	console.log = mock(() => void 0);
});

describe(createResponse.name, () => {
	test('should create a response with null as body if unused', () => {
		const time = performance.now();
		const status = 200;
		const input = null;
		expect(createResponse(input, status, time)).toBeInstanceOf(Response);
		expect(createResponse(input, status, time).bodyUsed).toEqual(false);
		expect(createResponse(input, status, time).status).toEqual(status);
	});

	test('should create a response with the input as body if used', async () => {
		const time = performance.now();
		const status = 200;
		const input = { ping: 'pong' };
		expect(createResponse(input, status, time)).toBeInstanceOf(Response);
		expect(createResponse(input, status, time).bodyUsed).toEqual(false);
		expect(createResponse(input, status, time).status).toEqual(status);
		expect(await createResponse(input, status, time).json()).toEqual(input);
	});
});
