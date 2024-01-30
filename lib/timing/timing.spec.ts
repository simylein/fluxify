import { describe, expect, test } from 'bun:test';
import { FluxifyRequest } from '../router/router.type';
import { start, stop, timing } from './timing';

const request = new Request('http://example.com') as FluxifyRequest;
request.times = [];

describe(start.name, () => {
	test('should start timing a request category', () => {
		start(request, 'routing');
		expect(request.times[0]).toEqual({ name: 'routing', start: expect.any(Number), stop: undefined });
	});

	test('should start timing a request category using provided time', () => {
		const time = performance.now();
		start(request, 'schema', time);
		expect(request.times[1]).toEqual({ name: 'schema', start: time, stop: undefined });
	});
});

describe(stop.name, () => {
	test('should stop timing a request category', () => {
		stop(request, 'routing');
		expect(request.times[0]).toEqual({ name: 'routing', start: expect.any(Number), stop: expect.any(Number) });
	});

	test('should stop timing a request category using provided time', () => {
		const time = performance.now();
		stop(request, 'schema', time);
		expect(request.times[1]).toEqual({ name: 'schema', start: expect.any(Number), stop: time });
	});
});

describe(timing.name, () => {
	test('should return an empty object given no times on request', () => {
		const req = new Request('http://example.com') as FluxifyRequest;
		req.times = [];
		expect(timing(req)).toEqual({});
	});

	test('should create server timing header with routing and schema durations', () => {
		const routing = (request.times[0].stop ?? 0) - request.times[0].start;
		const schema = (request.times[1].stop ?? 0) - request.times[1].start;
		const timings = timing(request);
		expect(timings).toEqual({ 'server-timing': `routing;dur=${routing.toFixed(6)},schema;dur=${schema.toFixed(6)}` });
	});
});
