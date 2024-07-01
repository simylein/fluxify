import { beforeAll, describe, expect, test } from 'bun:test';
import { config } from '../config/config';
import { expectType } from '../test/expect-type';
import { fuse, router, routes, traverse } from './router';
import { Route } from './router.type';

const app = router();

beforeAll(() => {
	config.globalPrefix = '';
	config.defaultVersion = 0;
});

describe(fuse.name, () => {
	test('should combine endpoint prefix version and base', () => {
		expect(fuse('/me', '/api', 1, '/auth')).toEqual('/api/v1/auth/me');
		expectType<string>(fuse('/me', '/api', 1, '/auth'));
	});

	test('should combine endpoint prefix and base and ignore undefined values', () => {
		expect(fuse('/me', '', undefined, undefined)).toEqual('/me');
		expectType<string>(fuse('/me', '', undefined, undefined));
	});

	test('should remove trailing slashes from endpoint prefix and base', () => {
		expect(fuse('/me/', '/api/', 0, '/auth/')).toEqual('/api/auth/me');
	});

	test('should add missing leading slashes from endpoint prefix and base', () => {
		expect(fuse('me', 'api', 0, 'auth')).toEqual('/api/auth/me');
	});

	test('should add missing leading slashes and remove trailing slashes from endpoint prefix and base', () => {
		expect(fuse('me/', 'api/', 0, 'auth/')).toEqual('/api/auth/me');
	});

	test('should preserve standalone slashes', () => {
		expect(fuse('/', '/', 0, '/')).toEqual('/');
	});

	test('should return a slash if the combined string is empty', () => {
		expect(fuse('', '', 0, '')).toEqual('/');
	});

	test('should return the default version when not provided in path', () => {
		expect(fuse('me/', 'api', 1, '/auth')).toEqual('/api/v1/auth/me');
	});

	test('should accept optional object as base with path and version', () => {
		expect(fuse('me/', 'api', 0, { path: '/auth', version: 2 })).toEqual('/api/v2/auth/me');
	});

	test('should accept optional object as endpoint with path and version', () => {
		expect(fuse({ path: 'me', version: 3 }, 'api/', 0, '/auth')).toEqual('/api/v3/auth/me');
	});

	test('should accept both optional objects and prefer the endpoint', () => {
		expect(fuse({ path: '/me', version: 4 }, 'api', 0, { path: 'auth', version: 2 })).toEqual('/api/v4/auth/me');
	});

	test('should accept optional object as base and override global prefix', () => {
		expect(fuse('', 'api', 0, { path: '/home', prefix: '' })).toEqual('/home');
	});

	test('should accept optional object as endpoint and override global prefix', () => {
		expect(fuse({ path: '/home', prefix: '' }, 'api', 0, '')).toEqual('/home');
	});

	test('should accept both optional objects and prefer the endpoint', () => {
		expect(fuse({ path: '/home', prefix: '' }, 'api', 0, { path: '', prefix: 'api' })).toEqual('/home');
	});
});

describe(app.all.name, () => {
	test('should add an all route', () => {
		const method: Route['method'] = 'all';
		const endpoint: Route['endpoint'] = '/all';
		const schema: Route['schema'] = null;
		const handler: Route['handler'] = () => null;

		app.all(endpoint, schema, handler);

		const prefixedEndpoint = `${config.globalPrefix}${endpoint}`;
		const target = traverse(routes, prefixedEndpoint).get(method);
		expect(target).toEqual({ method, schema, endpoint: prefixedEndpoint, handler });
	});
});

describe(app.get.name, () => {
	test('should add a get route', () => {
		const method: Route['method'] = 'get';
		const endpoint: Route['endpoint'] = '/user';
		const schema: Route['schema'] = null;
		const handler: Route['handler'] = () => null;

		app.get(endpoint, schema, handler);

		const prefixedEndpoint = `${config.globalPrefix}${endpoint}`;
		const target = traverse(routes, prefixedEndpoint).get(method);
		expect(target).toEqual({ method, schema, endpoint: prefixedEndpoint, handler });
	});
});

describe(app.post.name, () => {
	test('should add a post route', () => {
		const method: Route['method'] = 'post';
		const endpoint: Route['endpoint'] = '/user';
		const schema: Route['schema'] = null;
		const handler: Route['handler'] = () => null;

		app.post(endpoint, schema, handler);

		const prefixedEndpoint = `${config.globalPrefix}${endpoint}`;
		const target = traverse(routes, prefixedEndpoint).get(method);
		expect(target).toEqual({ method, schema, endpoint: prefixedEndpoint, handler });
	});
});

describe(app.put.name, () => {
	test('should add a put route', () => {
		const method: Route['method'] = 'put';
		const endpoint: Route['endpoint'] = '/user';
		const schema: Route['schema'] = null;
		const handler: Route['handler'] = () => null;

		app.put(endpoint, schema, handler);

		const prefixedEndpoint = `${config.globalPrefix}${endpoint}`;
		const target = traverse(routes, prefixedEndpoint).get(method);
		expect(target).toEqual({ method, schema, endpoint: prefixedEndpoint, handler });
	});
});

describe(app.patch.name, () => {
	test('should add a patch route', () => {
		const method: Route['method'] = 'patch';
		const endpoint: Route['endpoint'] = `${config.globalPrefix}/user`;
		const schema: Route['schema'] = null;
		const handler: Route['handler'] = () => null;

		app.patch(endpoint, schema, handler);

		const prefixedEndpoint = `${config.globalPrefix}${endpoint}`;
		const target = traverse(routes, prefixedEndpoint).get(method);
		expect(target).toEqual({ method, schema, endpoint: prefixedEndpoint, handler });
	});
});

describe(app.delete.name, () => {
	test('should add a delete route', () => {
		const method: Route['method'] = 'delete';
		const endpoint: Route['endpoint'] = '/user';
		const schema: Route['schema'] = null;
		const handler: Route['handler'] = () => null;

		app.delete(endpoint, schema, handler);

		const prefixedEndpoint = `${config.globalPrefix}${endpoint}`;
		const target = traverse(routes, prefixedEndpoint).get(method);
		expect(target).toEqual({ method, schema, endpoint: prefixedEndpoint, handler });
	});
});
