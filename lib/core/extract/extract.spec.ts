import { describe, expect, test } from 'bun:test';
import { Route } from '../../router/router.type';
import { extractMethod, extractParam } from './extract';

const makeEndpoint = (endpoint: Route['endpoint']): Route => {
	return { method: 'get', endpoint, schema: null, handler: () => null };
};

describe(extractMethod.name, () => {
	test('should accept the methods get post put patch and delete', () => {
		expect(extractMethod('get')).toEqual('get');
		expect(extractMethod('post')).toEqual('post');
		expect(extractMethod('put')).toEqual('put');
		expect(extractMethod('patch')).toEqual('patch');
		expect(extractMethod('delete')).toEqual('delete');
		expect(extractMethod('options')).toEqual('options');
	});

	test('should throw method not allowed for invalid methods', () => {
		expect(() => extractMethod('')).toThrow('method not allowed');
		expect(() => extractMethod('hello-world')).toThrow('method not allowed');
	});
});

describe(extractParam.name, () => {
	test('should extract params from endpoints', () => {
		expect(extractParam(makeEndpoint('/auth/:uuid'), '/auth')).toEqual({});
		expect(extractParam(makeEndpoint('/auth/:uuid'), '/auth/')).toEqual({ uuid: '' });
		expect(extractParam(makeEndpoint('/auth/:uuid'), '/auth/uuid-string')).toEqual({ uuid: 'uuid-string' });
	});

	test('should extract params from nested endpoints', () => {
		expect(extractParam(makeEndpoint('/auth/:uuid/user/:id'), '/auth/uuid-string/user/id-string')).toEqual({
			id: 'id-string',
			uuid: 'uuid-string',
		});
		expect(
			extractParam(makeEndpoint('/auth/:uuid/user/:id/:query'), '/auth/uuid-string/user/id-string/hello-world'),
		).toEqual({
			id: 'id-string',
			uuid: 'uuid-string',
			query: 'hello-world',
		});
	});
});
