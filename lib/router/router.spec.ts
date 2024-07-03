import { beforeAll, describe, expect, mock, test } from 'bun:test';
import { config } from '../config/config';
import { colorMethod } from '../logger/color';
import { expectType } from '../test/expect-type';
import { fuse, pick, register, router, routes, traverse } from './router';
import { Route } from './router.type';

const app = router();

const mapObject = (map: Map<string, unknown>): Record<string, unknown> => {
	const object: Record<string, unknown> = {};
	for (const [key, value] of map.entries()) {
		object[key] = value instanceof Map ? mapObject(value) : value;
	}
	return object;
};

beforeAll(() => {
	config.globalPrefix = '';
	config.defaultVersion = 0;
	console.debug = mock(() => void 0);
	console.warn = mock(() => void 0);
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

describe(register.name, () => {
	const route: Route = { method: 'get', endpoint: '/hello', schema: null, handler: () => null };
	test('should register a new route', () => {
		register(route);
		expect(mapObject(routes)).toEqual({ hello: { get: route } });
	});

	test('should call debug on console about the mapped route', () => {
		expect(console.debug).toHaveBeenCalledWith(
			expect.stringContaining(`mapped route ${colorMethod(route.method)} ${route.endpoint}`),
		);
	});

	test('should not override an existing route', () => {
		const conflicting: Route = { method: 'get', endpoint: '/hello', schema: null, handler: () => null };
		register(conflicting);
		expect(mapObject(routes)).toEqual({ hello: { get: route } });
	});

	test('should call warn on console about the ambiguous route', () => {
		expect(console.warn).toHaveBeenCalledWith(
			expect.stringContaining(`ambiguous route ${colorMethod(route.method)} ${route.endpoint}`),
		);
	});

	test('should register all routes with all methods', () => {
		routes.clear();
		const getRoute: Route = { method: 'get', endpoint: '/api/hello-world', schema: null, handler: () => null };
		register(getRoute);
		const postRoute: Route = { method: 'post', endpoint: '/api/hello-world', schema: null, handler: () => null };
		register(postRoute);
		const putRoute: Route = { method: 'put', endpoint: '/api/hello-world', schema: null, handler: () => null };
		register(putRoute);
		const patchRoute: Route = { method: 'patch', endpoint: '/api/hello-world', schema: null, handler: () => null };
		register(patchRoute);
		const deleteRoute: Route = { method: 'delete', endpoint: '/api/hello-world', schema: null, handler: () => null };
		register(deleteRoute);
		expect(mapObject(routes)).toEqual({
			api: { 'hello-world': { get: getRoute, post: postRoute, put: putRoute, patch: patchRoute, delete: deleteRoute } },
		});
	});
});

describe(pick.name, () => {
	test('should return undefined given an empty map', () => {
		expect(pick(new Map(), 'all')).toBeUndefined();
		expect(pick(new Map(), 'get')).toBeUndefined();
		expect(pick(new Map(), 'post')).toBeUndefined();
		expect(pick(new Map(), 'put')).toBeUndefined();
		expect(pick(new Map(), 'patch')).toBeUndefined();
		expect(pick(new Map(), 'delete')).toBeUndefined();
		expect(pick(new Map(), 'options')).toBeUndefined();
		expect(pick(new Map(), 'head')).toBeUndefined();
	});

	test('should return the route which matches the get method', () => {
		const getRoute: Route = { method: 'get', endpoint: '/', schema: null, handler: () => null };
		expect(pick(new Map().set(getRoute.method, getRoute), getRoute.method)).toEqual(getRoute);
		const postRoute: Route = { method: 'post', endpoint: '/', schema: null, handler: () => null };
		expect(pick(new Map().set(postRoute.method, postRoute), postRoute.method)).toEqual(postRoute);
		const putRoute: Route = { method: 'put', endpoint: '/', schema: null, handler: () => null };
		expect(pick(new Map().set(putRoute.method, putRoute), putRoute.method)).toEqual(putRoute);
		const patchRoute: Route = { method: 'patch', endpoint: '/', schema: null, handler: () => null };
		expect(pick(new Map().set(patchRoute.method, patchRoute), patchRoute.method)).toEqual(patchRoute);
		const deleteRoute: Route = { method: 'delete', endpoint: '/', schema: null, handler: () => null };
		expect(pick(new Map().set(deleteRoute.method, deleteRoute), deleteRoute.method)).toEqual(deleteRoute);
	});

	test('should return the get route given the head method', () => {
		const route: Route = { method: 'get', endpoint: '/', schema: null, handler: () => null };
		expect(pick(new Map().set(route.method, route), 'head')).toEqual(route);
	});

	test('should return the all route given any method', () => {
		const route: Route = { method: 'all', endpoint: '/', schema: null, handler: () => null };
		expect(pick(new Map().set(route.method, route), 'get')).toEqual(route);
		expect(pick(new Map().set(route.method, route), 'post')).toEqual(route);
		expect(pick(new Map().set(route.method, route), 'put')).toEqual(route);
		expect(pick(new Map().set(route.method, route), 'patch')).toEqual(route);
		expect(pick(new Map().set(route.method, route), 'delete')).toEqual(route);
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
		const target = traverse(routes, prefixedEndpoint)?.get(method);
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
		const target = traverse(routes, prefixedEndpoint)?.get(method);
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
		const target = traverse(routes, prefixedEndpoint)?.get(method);
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
		const target = traverse(routes, prefixedEndpoint)?.get(method);
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
		const target = traverse(routes, prefixedEndpoint)?.get(method);
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
		const target = traverse(routes, prefixedEndpoint)?.get(method);
		expect(target).toEqual({ method, schema, endpoint: prefixedEndpoint, handler });
	});
});
