import { serve, Serve, Server, version } from 'bun';
import { randomUUID } from 'crypto';
import pack from '../../../package.json';
import { verifyJwt } from '../../auth/jwt';
import { cacheExpiry, cacheInsert, cacheLfu, cacheLookup, cacheOptions } from '../../cache/cache';
import { config } from '../../config/config';
import { plan, run, tabs } from '../../cron/cron';
import { HttpException, Locked, Unauthorized } from '../../exception/exception';
import { debug, error, info, logger, req, res } from '../../logger/logger';
import { pick, routes, traverse } from '../../router/router';
import { FluxifyRequest, Param, Query, Route } from '../../router/router.type';
import { throttleLookup, throttleOptions } from '../../throttle/throttle';
import { start, stop } from '../../timing/timing';
import { ValidationError } from '../../validation/error';
import { extractMethod, extractParam } from '../extract/extract';
import { parseBody, parseIp } from '../request/request';
import { createResponse, header } from '../response/response';
import { serialize } from '../serialize/serialize';
import { FluxifyServer } from './boot.type';

declare global {
	// eslint-disable-next-line no-var
	var server: FluxifyServer;
}

export const bootstrap = (): FluxifyServer => {
	const options: Serve = {
		port: config.stage === 'test' ? 0 : config.port,
		development: config.stage === 'dev',
		async fetch(request: FluxifyRequest, server: Server): Promise<Response> {
			try {
				request.time = performance.now();
				request.id = randomUUID();
				request.ip = parseIp(request, server);
				if (config.stage !== 'prod') request.times = [];

				start(request, 'url');
				const url = new URL(request.url);
				const method = extractMethod(request.method);
				const endpoint = url.pathname;
				stop(request, 'url');

				req(request, method, endpoint);

				start(request, 'routing');
				const matchingRoutes = traverse(global.server.routes, endpoint);
				const targetRoute = pick(matchingRoutes, method);
				stop(request, 'routing');

				const cache = cacheOptions(request, targetRoute);
				const throttle = throttleOptions(targetRoute);

				if (method === 'options') {
					const matching = Array.from(matchingRoutes?.values() ?? []).flat() as Route[];
					const auth = matching.filter((route) => route.schema?.jwt);
					if (auth.length > 0) {
						const methods = auth.map((route) => route.method);
						return createResponse(null, 200, request, {
							'access-control-allow-origin': config.allowOrigin,
							'access-control-allow-headers': 'authorization,content-type',
							'access-control-allow-methods': methods.join(', ').toUpperCase(),
							'access-control-allow-credentials': 'true',
						});
					} else {
						const methods = matching.map((route) => route.method);
						return createResponse(null, 200, request, { allow: methods.join(', ').toUpperCase() });
					}
				}

				start(request, 'auth');
				let jwt: unknown | null = null;
				const token = request.headers.get('authorization');
				const cookie = request.headers.get('cookie');
				if (
					(!!token && token.toLowerCase().startsWith('bearer ')) ||
					(!!cookie && cookie.toLowerCase().startsWith('bearer='))
				) {
					jwt = verifyJwt(token ? token.split(' ')[1].trim() : cookie ? cookie.split('=')[1].trim() : '');
				}
				stop(request, 'auth');

				if (targetRoute) {
					if (throttle.use) {
						start(request, 'throttle');
						const criteria = (jwt as { id?: string })?.id ?? request.ip;
						if (config.throttleTtl === throttle.ttl && config.throttleLimit === throttle.limit) {
							const globally = throttleLookup(global.server.throttle, criteria, 'globally', 'all', throttle.ttl);
							if (globally.hits > config.throttleLimit) {
								debug(`throttle limit on route ${targetRoute.endpoint}`);
								const status = 429;
								stop(request, 'throttle');
								return createResponse({ status, message: 'too many requests' }, status, request, {
									'retry-after': `${Math.ceil((globally.exp - Date.now()) / 1000)}`,
								});
							}
						} else {
							const locally = throttleLookup(global.server.throttle, criteria, endpoint, method, throttle.ttl);
							if (locally.hits > throttle.limit) {
								debug(`throttle limit on route ${targetRoute.endpoint}`);
								const status = 429;
								stop(request, 'throttle');
								return createResponse({ status, message: 'too many requests' }, status, request, {
									'retry-after': `${Math.ceil((locally.exp - Date.now()) / 1000)}`,
								});
							}
						}
						stop(request, 'throttle');
					}

					if (config.databaseMode === 'readonly' && method !== 'get') {
						throw Locked();
					}

					start(request, 'request');
					let param: Param | unknown = extractParam(targetRoute, endpoint);
					let query: Query | unknown = Object.fromEntries(url.searchParams);
					let body = await parseBody(request);
					stop(request, 'request');

					if (targetRoute.schema) {
						start(request, 'schema');
						if (targetRoute.schema.jwt) {
							if (!jwt) {
								stop(request, 'schema');
								throw Unauthorized();
							}
							jwt = targetRoute.schema.jwt.parse(jwt);
						}
						if (targetRoute.schema.param) param = targetRoute.schema.param.parse(param);
						if (targetRoute.schema.query) query = targetRoute.schema.query.parse(query);
						if (targetRoute.schema.body) body = targetRoute.schema.body.parse(body);
						stop(request, 'schema');
					}

					if (cache.use) {
						start(request, 'cache');
						const hit = cacheLookup(global.server.cache, request, jwt);
						if (hit) {
							debug(`cache hit on route ${targetRoute.endpoint}`);
							stop(request, 'cache');
							return createResponse(hit.data, hit.status, request, { expires: new Date(hit.exp).toUTCString() });
						}
						stop(request, 'cache');
					}

					if (method === 'head') {
						return createResponse(null, 200, request);
					}

					start(request, 'handler');
					const data = await targetRoute.handler({ param, query, body, jwt, req: request });
					if (data instanceof Response) {
						res(request.id, data.status, performance.now() - request.time, (await data.clone().blob()).size);
						stop(request, 'handler');
						return data;
					}
					stop(request, 'handler');

					const status = targetRoute.method === 'post' ? 201 : data ? 200 : 204;
					if (cache.use) {
						cacheInsert(global.server.cache, request, jwt, cache.ttl, data, status);
						if (global.server.cache.size > config.cacheLimit) {
							const expiry = cacheExpiry(global.server.cache);
							const lfu = expiry ? null : cacheLfu(global.server.cache);
							debug(`cache limit reached purging ${expiry ? 'expired' : lfu ? 'lfu' : 'oldest'}`);
							global.server.cache.delete(expiry ?? lfu ?? global.server.cache.keys().next().value);
						}
					}
					return createResponse(data, status, request);
				} else if (matchingRoutes && matchingRoutes.size > 0) {
					const status = 405;
					return createResponse({ status, message: 'method not allowed' }, status, request);
				} else {
					const status = 404;
					return createResponse({ status, message: 'not found' }, status, request);
				}
			} catch (err) {
				if (err instanceof ValidationError) {
					const status = 400;
					return createResponse({ status, message: 'bad request', detail: err.message }, status, request);
				}
				if (err instanceof HttpException) {
					const status = err.status;
					return createResponse({ status, message: err.message, detail: err.detail }, status, request);
				}
				error((err as Error)?.message, config.logLevel === 'trace' ? err : '');
				const status = 500;
				return createResponse(
					{
						status,
						message: 'internal server error',
						detail: config.stage === 'dev' ? (err as Error)?.message : undefined,
					},
					status,
					request,
				);
			}
		},
		error(request: Error): Response {
			error(request.message, config.logLevel === 'trace' ? request : '');
			const status = 500;
			return new Response(
				JSON.stringify({
					status,
					message: 'internal server error',
					detail: config.stage === 'dev' ? request.message : undefined,
				}),
				{ status },
			);
		},
	};

	info(`starting http server...`);
	info(`bun v${version} ${pack.name} v${pack.version}`);
	if (config.cacheTtl && config.cacheLimit) {
		debug(`cache ttl ${config.cacheTtl} with limit ${config.cacheLimit}`);
	}
	if (config.throttleTtl && config.throttleLimit) {
		debug(`throttle ttl ${config.throttleTtl} with limit ${config.throttleLimit}`);
	}
	info(`log level is set to ${config.logLevel}`);
	info(`using database ${config.databasePath}`);
	debug(`database mode is ${config.databaseMode}`);
	if (config.allowOrigin !== '*') {
		debug(`allowed origin is ${config.allowOrigin}`);
	}
	if (config.globalPrefix) {
		debug(`global prefix is ${config.globalPrefix}`);
	}
	if (config.defaultVersion) {
		debug(`default version is v${config.defaultVersion}`);
	}
	if (!global.server) {
		global.server = serve(options) as FluxifyServer;
		global.server.cache = new Map();
		global.server.throttle = new Map();
	} else {
		global.server.reload(options);
		global.server.tabs.forEach((tab) => (tab.timer ? clearTimeout(tab.timer) : void 0));
	}
	global.server.routes = routes;
	global.server.tabs = tabs;
	global.server.logger = logger;
	global.server.header = header;
	global.server.serialize = serialize;

	global.server.tabs.forEach((tab, ind) => {
		const init = (): void => {
			global.server.tabs[ind].timer = setTimeout(async () => {
				await run(tab);
				init();
			}, plan(tab));
		};
		init();
	});

	// TODO: count total amount of routes and routes with auth
	info(`mapped ${null} routes of which ${null} have auth`);
	info(`listening for requests on localhost:${config.port}`);
	debug(`request logging is ${config.logRequests ? 'active' : 'inactive'}`);
	debug(`response logging is ${config.logResponses ? 'active' : 'inactive'}`);

	return global.server;
};
