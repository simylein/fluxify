import { serve, Serve, Server, version } from 'bun';
import { randomUUID } from 'crypto';
import pack from '../../../package.json';
import { verifyJwt } from '../../auth/jwt';
import { cacheInsert, cacheLfu, cacheLookup, cacheOptions } from '../../cache/cache';
import { config } from '../../config/config';
import { plan, run, tabs } from '../../cron/cron';
import { HttpException, Locked, Unauthorized } from '../../exception/exception';
import { colorMethod } from '../../logger/color';
import { debug, error, info, logger, req, res, warn } from '../../logger/logger';
import { routes } from '../../router/router';
import { FluxifyRequest, Param, Query } from '../../router/router.type';
import { throttleOptions } from '../../throttle/throttle';
import { start, stop } from '../../timing/timing';
import { ValidationError } from '../../validation/error';
import { compareEndpoint, compareMethod } from '../compare/compare';
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
				const matchingRoutes = global.server.routes.filter((route) => compareEndpoint(route, endpoint));
				const targetRoute = matchingRoutes.find((route) => compareMethod(route, method));
				stop(request, 'routing');

				const cache = cacheOptions(request, targetRoute);
				const throttle = throttleOptions(targetRoute);

				if (method === 'options') {
					const authRoutes = matchingRoutes.filter((route) => route.schema?.jwt);
					if (authRoutes.length > 0) {
						const methods = authRoutes.filter((route) => compareEndpoint(route, endpoint)).map((route) => route.method);
						return createResponse(null, 200, request, {
							'access-control-allow-origin': config.allowOrigin,
							'access-control-allow-headers': 'authorization,content-type',
							'access-control-allow-methods': methods.join(', ').toUpperCase(),
							'access-control-allow-credentials': 'true',
						});
					} else {
						const methods = matchingRoutes.map((route) => route.method);
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
							const globally = global.server.throttle[criteria]?.['']?.[''];
							if (globally) {
								if (globally.exp < Date.now()) {
									globally.exp = Date.now() + config.throttleTtl * 1000;
									globally.hits = 0;
								}
								globally.hits += 1;
								if (globally.hits > config.throttleLimit) {
									debug(`throttle limit on route ${endpoint}`);
									const status = 429;
									stop(request, 'throttle');
									return createResponse({ status, message: 'too many requests' }, status, request, {
										'retry-after': `${Math.ceil((globally.exp - Date.now()) / 1000)}`,
									});
								}
							} else {
								if (!global.server.throttle[criteria]) {
									global.server.throttle[criteria] = {};
								}
								if (!global.server.throttle[criteria]['']) {
									global.server.throttle[criteria][''] = {};
								}
								global.server.throttle[criteria][''][''] = {
									exp: Date.now() + throttle.ttl * 1000,
									hits: 1,
								};
							}
						} else {
							const locally = global.server.throttle[criteria]?.[endpoint]?.[method];
							if (locally) {
								if (locally.exp < Date.now()) {
									locally.exp = Date.now() + throttle.ttl * 1000;
									locally.hits = 0;
								}
								locally.hits += 1;
								if (locally.hits > throttle.limit) {
									debug(`throttle limit on route ${endpoint}`);
									const status = 429;
									stop(request, 'throttle');
									return createResponse({ status, message: 'too many requests' }, status, request, {
										'retry-after': `${Math.ceil((locally.exp - Date.now()) / 1000)}`,
									});
								}
							} else {
								if (!global.server.throttle[criteria]) {
									global.server.throttle[criteria] = {};
								}
								if (!global.server.throttle[criteria][endpoint]) {
									global.server.throttle[criteria][endpoint] = {};
								}
								global.server.throttle[criteria][endpoint][method] = {
									exp: Date.now() + throttle.ttl * 1000,
									hits: 1,
								};
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
							debug(`cache hit on route ${endpoint}`);
							stop(request, 'cache');
							return createResponse(hit.data, hit.status, request, { expires: new Date(hit.exp).toUTCString() });
						}
						stop(request, 'cache');
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
							const lfu = cacheLfu(global.server.cache);
							global.server.cache.delete(lfu ?? global.server.cache.keys().next().value);
						}
					}
					return createResponse(data, status, request);
				} else if (matchingRoutes.length > 0) {
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
	} else {
		global.server.reload(options);
		global.server.tabs.forEach((tab) => (tab.timer ? clearTimeout(tab.timer) : void 0));
	}
	global.server.routes = routes;
	global.server.tabs = tabs;
	global.server.cache = new Map();
	global.server.throttle = {};
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

	routes.map((route, _index, array) =>
		array.filter((rout) => rout.endpoint === route.endpoint && rout.method === route.method).length > 1
			? warn(`ambiguous route ${colorMethod(route.method)} ${route.endpoint}`)
			: debug(`mapped route ${colorMethod(route.method)} ${route.endpoint}`),
	);
	info(`mapped ${routes.length} routes of which ${routes.filter((route) => route.schema?.jwt).length} have auth`);
	info(`listening for requests on localhost:${config.port}`);
	debug(`request logging is ${config.logRequests ? 'active' : 'inactive'}`);
	debug(`response logging is ${config.logResponses ? 'active' : 'inactive'}`);

	return global.server;
};
