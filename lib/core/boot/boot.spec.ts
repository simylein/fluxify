import { afterAll, beforeAll, describe, expect, mock, test } from 'bun:test';
import { randomUUID } from 'crypto';
import { jwtDto } from '../../auth/jwt.dto';
import { config } from '../../config/config';
import { Conflict, Forbidden, Gone, InternalServerError } from '../../exception/exception';
import { router } from '../../router/router';
import { expectType } from '../../test/expect-type';
import { number } from '../../validation/number/number';
import { object } from '../../validation/object/object';
import { string } from '../../validation/string/string';
import { defaultHeaders } from '../response/response';
import { bootstrap } from './boot';
import { FluxifyServer } from './boot.type';

let server: FluxifyServer;
let value: number | undefined;

beforeAll(() => {
	config.cacheTtl = 4;
	config.cacheLimit = 8;
	config.throttleTtl = 8;
	config.throttleLimit = 4;
	config.databaseMode = 'readwrite';
	config.globalPrefix = '';
	config.defaultVersion = 0;
	console.log = mock(() => void 0);
	console.debug = mock(() => void 0);
	console.info = mock(() => void 0);
	const app = router();
	app.get('/methods', null, () => {
		return null;
	});
	app.post('/methods', null, () => {
		return null;
	});
	app.patch('/methods', null, () => {
		return null;
	});
	app.get('/auth/methods', null, () => {
		return null;
	});
	app.post('/auth/methods', { jwt: jwtDto }, () => {
		return null;
	});
	app.patch('/auth/methods', { jwt: jwtDto }, () => {
		return null;
	});
	app.get('/hello', null, () => {
		return { hello: 'world' };
	});
	app.post('/void', null, () => {
		return { void: null };
	});
	app.get('/bad-request', { param: object({ id: number() }) }, () => {
		return null;
	});
	app.get('/unauthorized', { jwt: jwtDto }, () => {
		return null;
	});
	app.get('/forbidden', null, () => {
		throw Forbidden();
	});
	app.get('/conflict', null, () => {
		throw Conflict();
	});
	app.get('/gone', null, () => {
		throw Gone();
	});
	app.get('/error', null, () => {
		throw InternalServerError('something went very wrong');
	});
	app.get('/throw', null, () => {
		throw Error('up');
	});
	app.get('/custom', null, () => {
		return new Response('custom response body', { status: 240 });
	});
	app.get('/param/:id', { param: object({ id: number().transform() }) }, ({ param }) => {
		return param;
	});
	app.get('/param/:uuid/and/:id', { param: object({ id: number().transform(), uuid: string() }) }, ({ param }) => {
		return param;
	});
	app.get('/query', { query: object({ hello: string(), lorem: string().optional() }) }, ({ query }) => {
		return query;
	});
	app.post('/body', { body: object({ ping: string(), hello: string() }) }, ({ body }) => {
		return body;
	});
	app.get('/cache', null, () => {
		return { value: Math.random() };
	});
	app.get('/throttle', null, () => {
		return null;
	});
	server = bootstrap();
});

afterAll(() => {
	server.stop();
});

describe(bootstrap.name, () => {
	test('should create a http server', () => {
		expect(server.port).toBeGreaterThan(0);
		expect(server.hostname).toEqual('localhost');
		expect(server.development).toEqual(false);
		expect(server.pendingRequests).toEqual(0);
		expect(server.pendingWebSockets).toEqual(0);
		expect(server.routes).toBeArray();
		expect(server.cache).toBeArrayOfSize(0);
		expect(server.fetch).toBeInstanceOf(Function);
		expect(server.upgrade).toBeInstanceOf(Function);
		expect(server.publish).toBeInstanceOf(Function);
		expect(server.reload).toBeInstanceOf(Function);
		expect(server.stop).toBeInstanceOf(Function);
		expect(server.logger).toBeInstanceOf(Function);
		expect(server.header).toBeInstanceOf(Function);
		expect(server.serialize).toBeInstanceOf(Function);
		expectType<FluxifyServer>(server);
	});

	test('should return no body and no allow header', async () => {
		const response = await server.fetch(new Request(`http://${server.hostname}:${server.port}`, { method: 'options' }));
		const data = await response.text();

		expect(Object.fromEntries(response.headers.entries())).toEqual({
			allow: '',
			'server-timing': expect.any(String),
			...defaultHeaders,
		});
		expect(data).toEqual('');
	});

	test('should return no body and the appropriate allow header', async () => {
		const response = await server.fetch(
			new Request(`http://${server.hostname}:${server.port}/methods`, { method: 'options' }),
		);
		const data = await response.text();

		expect(Object.fromEntries(response.headers.entries())).toEqual({
			allow: 'get, post, patch'.toUpperCase(),
			'server-timing': expect.any(String),
			...defaultHeaders,
		});
		expect(data).toEqual('');
	});

	test('should return no body and the appropriate access control allow header with auth', async () => {
		const response = await server.fetch(
			new Request(`http://${server.hostname}:${server.port}/auth/methods`, { method: 'options' }),
		);
		const data = await response.text();

		expect(Object.fromEntries(response.headers.entries())).toEqual({
			...defaultHeaders,
			'server-timing': expect.any(String),
			'access-control-allow-headers': 'authorization,content-type',
			'access-control-allow-methods': 'post, patch'.toUpperCase(),
			'access-control-allow-credentials': 'true',
		});
		expect(data).toEqual('');
	});

	test('should return hello world because the route and method matches', async () => {
		const response = await server.fetch(`http://${server.hostname}:${server.port}/hello`);
		const data = await response.json();

		expect(response.status).toEqual(200);
		expect(data).toEqual({ hello: 'world' });
	});

	test('should return bad request and tell what is missing', async () => {
		const response = await server.fetch(`http://${server.hostname}:${server.port}/bad-request`);
		const data = await response.json();

		expect(response.status).toEqual(400);
		expect(data).toEqual({ status: 400, message: 'bad request', detail: 'id is missing and should be of type number' });
	});

	test('should return unauthorized because no authorization header was provided', async () => {
		const response = await server.fetch(`http://${server.hostname}:${server.port}/unauthorized`);
		const data = await response.json();

		expect(response.status).toEqual(401);
		expect(data).toEqual({ status: 401, message: 'unauthorized' });
	});

	test('should return forbidden because the handler throws', async () => {
		const response = await server.fetch(`http://${server.hostname}:${server.port}/forbidden`);
		const data = await response.json();

		expect(response.status).toEqual(403);
		expect(data).toEqual({ status: 403, message: 'forbidden' });
	});

	test('should return not found because no routes match', async () => {
		const response = await server.fetch(`http://${server.hostname}:${server.port}`);
		const data = await response.json();

		expect(response.status).toEqual(404);
		expect(data).toEqual({ status: 404, message: 'not found' });
	});

	test('should return method not allowed because route matches but method is wrong', async () => {
		const response = await server.fetch(`http://${server.hostname}:${server.port}/void`);
		const data = await response.json();

		expect(response.status).toEqual(405);
		expect(data).toEqual({ status: 405, message: 'method not allowed' });
	});

	test('should return conflict because the handler throws', async () => {
		const response = await server.fetch(`http://${server.hostname}:${server.port}/conflict`);
		const data = await response.json();

		expect(response.status).toEqual(409);
		expect(data).toEqual({ status: 409, message: 'conflict' });
	});

	test('should return conflict because the handler throws', async () => {
		const response = await server.fetch(`http://${server.hostname}:${server.port}/gone`);
		const data = await response.json();

		expect(response.status).toEqual(410);
		expect(data).toEqual({ status: 410, message: 'gone' });
	});

	test('should return internal server error because the handler throws', async () => {
		const response = await server.fetch(`http://${server.hostname}:${server.port}/error`);
		const data = await response.json();

		expect(response.status).toEqual(500);
		expect(data).toEqual({ status: 500, message: 'internal server error', detail: 'something went very wrong' });
	});

	test('should return internal server error because the handler throws up', async () => {
		const response = await server.fetch(`http://${server.hostname}:${server.port}/throw`);
		const data = await response.json();

		expect(response.status).toEqual(500);
		expect(data).toEqual({ status: 500, message: 'internal server error' });
	});

	test('should return a custom response body because a response was returned directly', async () => {
		const response = await server.fetch(`http://${server.hostname}:${server.port}/custom`);
		const data = await response.text();

		expect(response.status).toEqual(240);
		expect(data).toEqual('custom response body');
	});

	test('should return the id parameter', async () => {
		const id = 42;
		const response = await server.fetch(`http://${server.hostname}:${server.port}/param/${id}`);
		const data = await response.json();

		expect(response.status).toEqual(200);
		expect(data).toEqual({ id });
	});

	test('should return the uuid and id parameters', async () => {
		const uuid = randomUUID();
		const id = 42;
		const response = await server.fetch(`http://${server.hostname}:${server.port}/param/${uuid}/and/${id}`);
		const data = await response.json();

		expect(response.status).toEqual(200);
		expect(data).toEqual({ uuid, id });
	});

	test('should return the hello query parameter', async () => {
		const response = await server.fetch(`http://${server.hostname}:${server.port}/query?hello=world`);
		const data = await response.json();

		expect(response.status).toEqual(200);
		expect(data).toEqual({ hello: 'world' });
	});

	test('should return the hello and lorem query parameter', async () => {
		const response = await server.fetch(`http://${server.hostname}:${server.port}/query?hello=world&lorem=ipsum`);
		const data = await response.json();

		expect(response.status).toEqual(200);
		expect(data).toEqual({ hello: 'world', lorem: 'ipsum' });
	});

	test('should return the request body', async () => {
		const body = { ping: 'pong', hello: 'world' };
		const response = await server.fetch(
			new Request(`http://${server.hostname}:${server.port}/body`, { method: 'post', body: JSON.stringify(body) }),
		);
		const data = await response.json();

		expect(response.status).toEqual(201);
		expect(data).toEqual(body);
	});

	test('should return a live value', async () => {
		const response = await server.fetch(`http://${server.hostname}:${server.port}/cache`);
		const data = await response.json();

		expect(response.status).toEqual(200);
		expect(response.headers.get('expires')).toBeNull();
		expect(data).toEqual({ value: expect.any(Number) });
		value = (data as { value?: number }).value;
	});

	test('should return a cached value', async () => {
		const response = await server.fetch(`http://${server.hostname}:${server.port}/cache`);
		const data = await response.json();

		expect(response.status).toEqual(200);
		expect(response.headers.get('expires')).toEqual(new Date(Date.now() + config.cacheTtl * 1000).toUTCString());
		expect(data).toEqual({ value });
	});

	test('should return a forced non cached value', async () => {
		const response = await server.fetch(
			new Request(`http://${server.hostname}:${server.port}/cache`, { headers: { 'cache-control': 'no-cache' } }),
		);
		const data = await response.json();

		expect(response.status).toEqual(200);
		expect(response.headers.get('expires')).toBeNull();
		expect(data).not.toEqual({ value });
	});

	test('should throttle after configured amount of requests', async () => {
		const responses = await Promise.all(
			new Array(config.throttleLimit + 1)
				.fill(null)
				.map(() => server.fetch(`http://${server.hostname}:${server.port}/throttle`)),
		);

		responses.map((response, index) => {
			expect(response.status).toEqual(index === config.throttleLimit ? 429 : 204);
			expect(response.headers.get('retry-after')).toEqual(
				index === config.throttleLimit ? `${config.throttleTtl}` : null,
			);
		});
	});
});
