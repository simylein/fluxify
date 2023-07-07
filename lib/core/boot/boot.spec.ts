import { afterAll, beforeAll, describe, expect, mock, test } from 'bun:test';
import { randomUUID } from 'crypto';
import { jwtDto } from '../../auth/jwt.dto';
import { config } from '../../config/config';
import { Conflict, Forbidden, Gone, InternalServerError } from '../../exception/exception';
import { router } from '../../router/router';
import { number } from '../../validation/number/number';
import { object } from '../../validation/object/object';
import { defaultHeaders } from '../response/response';
import { bootstrap } from './boot';
import { FluxifyServer } from './boot.type';

let server: FluxifyServer;
let value: number | undefined;

beforeAll(() => {
	config.cacheTtl = 4;
	config.cacheLimit = 8;
	config.databaseMode = 'readwrite';
	console.log = mock(() => void 0);
	console.debug = mock(() => void 0);
	console.info = mock(() => void 0);
	const app = router();
	app.get('/methods', null, () => {
		return void 0;
	});
	app.post('/methods', null, () => {
		return void 0;
	});
	app.patch('/methods', null, () => {
		return void 0;
	});
	app.get('/auth/methods', null, () => {
		return void 0;
	});
	app.post('/auth/methods', { jwt: jwtDto }, () => {
		return void 0;
	});
	app.patch('/auth/methods', { jwt: jwtDto }, () => {
		return void 0;
	});
	app.get('/hello', null, () => {
		return { hello: 'world' };
	});
	app.post('/void', null, () => {
		return { void: null };
	});
	app.get('/bad-request', { param: object({ id: number() }) }, () => {
		return void 0;
	});
	app.get('/unauthorized', { jwt: jwtDto }, () => {
		return void 0;
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
		throw InternalServerError();
	});
	app.get('/throw', null, () => {
		throw 'up';
	});
	app.get('/custom', null, () => {
		return new Response('custom response body', { status: 240 });
	});
	app.get('/param/:id', null, ({ param }) => {
		return param;
	});
	app.get('/param/:uuid/and/:id', null, ({ param }) => {
		return param;
	});
	app.get('/query', null, ({ query }) => {
		return query;
	});
	app.post('/body', null, ({ body }) => {
		return body;
	});
	app.get('/cache', null, () => {
		return { value: Math.random() };
	});
	server = bootstrap();
});

afterAll(() => {
	server.stop();
});

describe(bootstrap.name, () => {
	test('should create a http server', () => {
		expect(server.port).toBeGreaterThan(0);
		expect(server.hostname).toEqual('0.0.0.0');
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
	});

	test('should return no body and no allow header', async () => {
		const response = await server.fetch(
			new Request(`http://${server.hostname}:${server.port}${config.globalPrefix}`, { method: 'options' }),
		);
		const data = await response.text();

		expect(Object.fromEntries(response.headers.entries())).toEqual({
			allow: '',
			...defaultHeaders,
		});
		expect(data).toEqual('');
	});

	test('should return no body and the appropriate allow header', async () => {
		const response = await server.fetch(
			new Request(`http://${server.hostname}:${server.port}${config.globalPrefix}/methods`, { method: 'options' }),
		);
		const data = await response.text();

		expect(Object.fromEntries(response.headers.entries())).toEqual({
			allow: 'get, post, patch'.toUpperCase(),
			...defaultHeaders,
		});
		expect(data).toEqual('');
	});

	test('should return no body and the appropriate access control allow header with auth', async () => {
		const response = await server.fetch(
			new Request(`http://${server.hostname}:${server.port}${config.globalPrefix}/auth/methods`, { method: 'options' }),
		);
		const data = await response.text();

		expect(Object.fromEntries(response.headers.entries())).toEqual({
			...defaultHeaders,
			'access-control-allow-headers': 'authorization',
			'access-control-allow-methods': 'post, patch'.toUpperCase(),
			'access-control-allow-credentials': 'true',
		});
		expect(data).toEqual('');
	});

	test('should return hello world because the route and method matches', async () => {
		const response = await server.fetch(`http://${server.hostname}:${server.port}${config.globalPrefix}/hello`);
		const data = await response.json();

		expect(response.status).toEqual(200);
		expect(data).toEqual({ hello: 'world' });
	});

	test('should return bad request and tell what is missing', async () => {
		const response = await server.fetch(`http://${server.hostname}:${server.port}${config.globalPrefix}/bad-request`);
		const data = await response.json();

		expect(response.status).toEqual(400);
		expect(data).toEqual({ status: 400, message: 'id is missing and should be of type number' });
	});

	test('should return unauthorized because no authorization header was provided', async () => {
		const response = await server.fetch(`http://${server.hostname}:${server.port}${config.globalPrefix}/unauthorized`);
		const data = await response.json();

		expect(response.status).toEqual(401);
		expect(data).toEqual({ status: 401, message: 'unauthorized' });
	});

	test('should return forbidden because the handler throws', async () => {
		const response = await server.fetch(`http://${server.hostname}:${server.port}${config.globalPrefix}/forbidden`);
		const data = await response.json();

		expect(response.status).toEqual(403);
		expect(data).toEqual({ status: 403, message: 'forbidden' });
	});

	test('should return not found because no routes match', async () => {
		const response = await server.fetch(`http://${server.hostname}:${server.port}${config.globalPrefix}`);
		const data = await response.json();

		expect(response.status).toEqual(404);
		expect(data).toEqual({ status: 404, message: 'not found' });
	});

	test('should return method not allowed because route matches but method is wrong', async () => {
		const response = await server.fetch(`http://${server.hostname}:${server.port}${config.globalPrefix}/void`);
		const data = await response.json();

		expect(response.status).toEqual(405);
		expect(data).toEqual({ status: 405, message: 'method not allowed' });
	});

	test('should return conflict because the handler throws', async () => {
		const response = await server.fetch(`http://${server.hostname}:${server.port}${config.globalPrefix}/conflict`);
		const data = await response.json();

		expect(response.status).toEqual(409);
		expect(data).toEqual({ status: 409, message: 'conflict' });
	});

	test('should return conflict because the handler throws', async () => {
		const response = await server.fetch(`http://${server.hostname}:${server.port}${config.globalPrefix}/gone`);
		const data = await response.json();

		expect(response.status).toEqual(410);
		expect(data).toEqual({ status: 410, message: 'gone' });
	});

	test('should return internal server error because the handler throws', async () => {
		const response = await server.fetch(`http://${server.hostname}:${server.port}${config.globalPrefix}/error`);
		const data = await response.json();

		expect(response.status).toEqual(500);
		expect(data).toEqual({ status: 500, message: 'internal server error' });
	});

	test('should throw up because the code in the handler does so', () => {
		expect(() => server.fetch(`http://${server.hostname}:${server.port}${config.globalPrefix}/throw`)).toThrow('up');
	});

	test('should return a custom response body because a response was returned directly', async () => {
		const response = await server.fetch(`http://${server.hostname}:${server.port}${config.globalPrefix}/custom`);
		const data = await response.text();

		expect(response.status).toEqual(240);
		expect(data).toEqual('custom response body');
	});

	test('should return the id parameter', async () => {
		const id = 42;
		const response = await server.fetch(`http://${server.hostname}:${server.port}${config.globalPrefix}/param/${id}`);
		const data = await response.json();

		expect(response.status).toEqual(200);
		expect(data).toEqual({ id: id.toString() });
	});

	test('should return the uuid and id parameters', async () => {
		const uuid = randomUUID();
		const id = 42;
		const response = await server.fetch(
			`http://${server.hostname}:${server.port}${config.globalPrefix}/param/${uuid}/and/${id}`,
		);
		const data = await response.json();

		expect(response.status).toEqual(200);
		expect(data).toEqual({ uuid, id: id.toString() });
	});

	test('should return the hello query parameter', async () => {
		const response = await server.fetch(
			`http://${server.hostname}:${server.port}${config.globalPrefix}/query?hello=world`,
		);
		const data = await response.json();

		expect(response.status).toEqual(200);
		expect(data).toEqual({ hello: 'world' });
	});

	test('should return the hello and lorem query parameter', async () => {
		const response = await server.fetch(
			`http://${server.hostname}:${server.port}${config.globalPrefix}/query?hello=world&lorem=ipsum`,
		);
		const data = await response.json();

		expect(response.status).toEqual(200);
		expect(data).toEqual({ hello: 'world', lorem: 'ipsum' });
	});

	test('should return the request body', async () => {
		const body = { ping: 'pong', hello: 'world' };
		const response = await server.fetch(
			new Request(`http://${server.hostname}:${server.port}${config.globalPrefix}/body`, {
				method: 'post',
				body: JSON.stringify(body),
			}),
		);
		const data = await response.json();

		expect(response.status).toEqual(201);
		expect(data).toEqual(body);
	});

	test('should return a live value', async () => {
		const response = await server.fetch(`http://${server.hostname}:${server.port}${config.globalPrefix}/cache`);
		const data = await response.json();

		expect(response.status).toEqual(200);
		expect(response.headers.get('expires')).toEqual(null);
		expect(data).toEqual({ value: expect.any(Number) });
		value = (data as { value?: number }).value;
	});

	test('should return a cached value', async () => {
		const response = await server.fetch(`http://${server.hostname}:${server.port}${config.globalPrefix}/cache`);
		const data = await response.json();

		expect(response.status).toEqual(200);
		expect(response.headers.get('expires')).toEqual(new Date(Date.now() + config.cacheTtl * 1000).toUTCString());
		expect(data).toEqual({ value });
	});

	test('should return a forced non cached value', async () => {
		const response = await server.fetch(
			new Request(`http://${server.hostname}:${server.port}${config.globalPrefix}/cache`, {
				headers: { 'cache-control': 'no-cache' },
			}),
		);
		const data = await response.json();

		expect(response.status).toEqual(200);
		expect(response.headers.get('expires')).toEqual(null);
		expect(data).not.toEqual({ value });
	});
});
