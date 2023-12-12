import { describe, expect, test } from 'bun:test';
import { config } from '../config/config';
import { compareEndpoint, compareMethod } from '../core/compare/compare';
import { expectType } from '../test/expect-type';
import { fuseEndpoint, router, routes } from './router';
import { Route } from './router.type';

const app = router();

describe(fuseEndpoint.name, () => {
	test('should combine endpoint prefix and base', () => {
		expect(fuseEndpoint('/me', '/api', '/auth')).toEqual('/api/auth/me');
		expectType<string>(fuseEndpoint('/me', '/api', '/auth'));
	});

	test('should combine endpoint prefix and base and ignore undefined values', () => {
		expect(fuseEndpoint('/me', undefined, undefined)).toEqual('/me');
		expectType<string>(fuseEndpoint('/me', undefined, undefined));
	});

	test('should remove trailing slashes from endpoint prefix and base', () => {
		expect(fuseEndpoint('/me/', '/api/', '/auth/')).toEqual('/api/auth/me');
	});

	test('should add missing leading slashes from endpoint prefix and base', () => {
		expect(fuseEndpoint('me', 'api', 'auth')).toEqual('/api/auth/me');
	});

	test('should add missing leading slashes and remove trailing slashes from endpoint prefix and base', () => {
		expect(fuseEndpoint('me/', 'api/', 'auth/')).toEqual('/api/auth/me');
	});

	test('should preserve standalone slashes', () => {
		expect(fuseEndpoint('/', '/', '/')).toEqual('/');
	});

	test('should return a slash if the combined string is empty', () => {
		expect(fuseEndpoint('', '', '')).toEqual('/');
	});

	test('should accept optional object as base with path and version', () => {
		expect(fuseEndpoint('me/', 'api', { path: '/auth', version: 1 })).toEqual('/api/v1/auth/me');
	});

	test('should accept optional object as endpoint with path and version', () => {
		expect(fuseEndpoint({ path: 'me', version: 2 }, 'api/', '/auth')).toEqual('/api/v2/auth/me');
	});

	test('should accept noth optional objects and prefer the endpoint', () => {
		expect(fuseEndpoint({ path: '/me', version: 3 }, 'api', { path: 'auth', version: 1 })).toEqual('/api/v3/auth/me');
	});
});

describe(app.all.name, () => {
	test('should add an all route', () => {
		const method: Route['method'] = 'all';
		const endpoint: Route['endpoint'] = '/all';
		const schema: Route['schema'] = null;
		const handler: Route['handler'] = () => void 0;

		app.all(endpoint, schema, handler);

		const prefixedEndpoint = `${config.globalPrefix}${endpoint}`;
		const target = routes.find((route) => compareEndpoint(route, prefixedEndpoint) && compareMethod(route, method));
		expect(target).toEqual({ method, schema, endpoint: prefixedEndpoint, handler });
	});
});

describe(app.get.name, () => {
	test('should add a get route', () => {
		const method: Route['method'] = 'get';
		const endpoint: Route['endpoint'] = '/user';
		const schema: Route['schema'] = null;
		const handler: Route['handler'] = () => void 0;

		app.get(endpoint, schema, handler);

		const prefixedEndpoint = `${config.globalPrefix}${endpoint}`;
		const target = routes.find((route) => compareEndpoint(route, prefixedEndpoint) && compareMethod(route, method));
		expect(target).toEqual({ method, schema, endpoint: prefixedEndpoint, handler });
	});
});

describe(app.post.name, () => {
	test('should add a post route', () => {
		const method: Route['method'] = 'post';
		const endpoint: Route['endpoint'] = '/user';
		const schema: Route['schema'] = null;
		const handler: Route['handler'] = () => void 0;

		app.post(endpoint, schema, handler);

		const prefixedEndpoint = `${config.globalPrefix}${endpoint}`;
		const target = routes.find((route) => compareEndpoint(route, prefixedEndpoint) && compareMethod(route, method));
		expect(target).toEqual({ method, schema, endpoint: prefixedEndpoint, handler });
	});
});

describe(app.put.name, () => {
	test('should add a put route', () => {
		const method: Route['method'] = 'put';
		const endpoint: Route['endpoint'] = '/user';
		const schema: Route['schema'] = null;
		const handler: Route['handler'] = () => void 0;

		app.put(endpoint, schema, handler);

		const prefixedEndpoint = `${config.globalPrefix}${endpoint}`;
		const target = routes.find((route) => compareEndpoint(route, prefixedEndpoint) && compareMethod(route, method));
		expect(target).toEqual({ method, schema, endpoint: prefixedEndpoint, handler });
	});
});

describe(app.patch.name, () => {
	test('should add a patch route', () => {
		const method: Route['method'] = 'patch';
		const endpoint: Route['endpoint'] = `${config.globalPrefix}/user`;
		const schema: Route['schema'] = null;
		const handler: Route['handler'] = () => void 0;

		app.patch(endpoint, schema, handler);

		const prefixedEndpoint = `${config.globalPrefix}${endpoint}`;
		const target = routes.find((route) => compareEndpoint(route, prefixedEndpoint) && compareMethod(route, method));
		expect(target).toEqual({ method, schema, endpoint: prefixedEndpoint, handler });
	});
});

describe(app.delete.name, () => {
	test('should add a delete route', () => {
		const method: Route['method'] = 'delete';
		const endpoint: Route['endpoint'] = '/user';
		const schema: Route['schema'] = null;
		const handler: Route['handler'] = () => void 0;

		app.delete(endpoint, schema, handler);

		const prefixedEndpoint = `${config.globalPrefix}${endpoint}`;
		const target = routes.find((route) => compareEndpoint(route, prefixedEndpoint) && compareMethod(route, method));
		expect(target).toEqual({ method, schema, endpoint: prefixedEndpoint, handler });
	});
});
