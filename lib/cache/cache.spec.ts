import { beforeAll, describe, expect, test } from 'bun:test';
import { config } from '../config/config';
import { FluxifyRequest, Route } from '../router/router.type';
import { cacheOptions } from './cache';

beforeAll(() => {
	config.cacheTtl = 4;
	config.cacheLimit = 8;
});

describe(cacheOptions.name, () => {
	test('should enable global cache options by default', () => {
		const request = new Request('http://example.com') as FluxifyRequest;
		const route = {} as Route;
		expect(cacheOptions(request, route)).toEqual({ use: true, ttl: 4, limit: 8 });
	});

	test('should enable custom cache options when overriding them in route', () => {
		const request = new Request('http://example.com') as FluxifyRequest;
		const route = { schema: { cache: { ttl: 60 } } } as Route;
		expect(cacheOptions(request, route)).toEqual({ use: true, ttl: 60, limit: 8 });
	});

	test('should disable custom cache options when overriding them in route', () => {
		const request = new Request('http://example.com') as FluxifyRequest;
		const route = { schema: { cache: { ttl: 0 } } } as Route;
		expect(cacheOptions(request, route)).toEqual({ use: false, ttl: 0, limit: 8 });
	});
});
