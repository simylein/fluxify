import { describe, expect, mock, test } from 'bun:test';
import { config } from '../config/config';
import { Route } from '../router/router.type';
import { throttleLookup, throttleOptions } from './throttle';

config.throttleTtl = 8;
config.throttleLimit = 4;
Date.now = mock(() => 42000);

const criteria = '127.0.0.1';
const endpoint = '/auth/me';
const method = 'get';
const entry = { exp: config.throttleTtl * 1000 + Date.now(), hits: 1 };

describe(throttleOptions.name, () => {
	test('should enable global throttle options by default', () => {
		const route = {} as Route;
		expect(throttleOptions(route)).toEqual({ use: true, ttl: 8, limit: 4 });
	});

	test('should enable custom throttle options when overriding them in route', () => {
		const route = { schema: { throttle: { ttl: 60 } } } as Route;
		expect(throttleOptions(route)).toEqual({ use: true, ttl: 60, limit: 4 });
	});

	test('should disable custom throttle options when overriding them in route', () => {
		const route = { schema: { throttle: { ttl: 0 } } } as Route;
		expect(throttleOptions(route)).toEqual({ use: false, ttl: 0, limit: 4 });
	});
});

describe(throttleLookup.name, () => {
	test('should return a new entry given no entries in the throttle', () => {
		const throttle = new Map();
		expect(throttleLookup(throttle, criteria, endpoint, method, config.throttleTtl)).toEqual({
			exp: Date.now() + config.throttleTtl * 1000,
			hits: 1,
		});
	});

	test('should return a new entry given no map children entries in the throttle', () => {
		const throttle = new Map();
		throttle.set(criteria, new Map());
		expect(throttleLookup(throttle, criteria, endpoint, method, config.throttleTtl)).toEqual({
			exp: Date.now() + config.throttleTtl * 1000,
			hits: 1,
		});
	});

	test('should return a new entry given no nested map children entries in the throttle', () => {
		const endpoints = new Map();
		endpoints.set(endpoint, new Map());
		const throttle = new Map();
		throttle.set(criteria, endpoints);
		expect(throttleLookup(throttle, criteria, endpoint, method, config.throttleTtl)).toEqual({
			exp: Date.now() + config.throttleTtl * 1000,
			hits: 1,
		});
	});

	test('should return an incremented entry given deeply nested map children entries in the throttle', () => {
		const methods = new Map();
		methods.set(method, entry);
		const endpoints = new Map();
		endpoints.set(endpoint, methods);
		const throttle = new Map();
		throttle.set(criteria, endpoints);
		expect(throttleLookup(throttle, criteria, endpoint, method, config.throttleTtl)).toEqual({
			exp: Date.now() + config.throttleTtl * 1000,
			hits: 2,
		});
	});

	test('should reset hits and return a new entry given deeply nested map children entries in the throttle', () => {
		const methods = new Map();
		methods.set(method, { ...entry, exp: Date.now() });
		const endpoints = new Map();
		endpoints.set(endpoint, methods);
		const throttle = new Map();
		throttle.set(criteria, endpoints);
		expect(throttleLookup(throttle, criteria, endpoint, method, config.throttleTtl)).toEqual({
			exp: Date.now() + config.throttleTtl * 1000,
			hits: 1,
		});
	});
});
