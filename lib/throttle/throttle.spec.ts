import { beforeAll, describe, expect, test } from 'bun:test';
import { config } from '../config/config';
import { Route } from '../router/router.type';
import { throttleOptions } from './throttle';

beforeAll(() => {
	config.throttleTtl = 8;
	config.throttleLimit = 4;
});

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
