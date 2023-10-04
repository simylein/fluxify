import { serve, Serve, Server, version } from 'bun';
import { randomUUID } from 'crypto';
import pack from '../../../package.json';
import { verifyJwt } from '../../auth/jwt';
import { config } from '../../config/config';
import { HttpException, Locked, Unauthorized } from '../../exception/exception';
import { bold, coloredMethod, reset } from '../../logger/color';
import { debug, error, info, logger, req, res, warn } from '../../logger/logger';
import { routes } from '../../router/router';
import { Param, Query } from '../../router/router.type';
import { ValidationError } from '../../validation/error';
import { compareEndpoint, compareMethod } from '../compare/compare';
import { extractMethod, extractParam } from '../extract/extract';
import { parseBody } from '../request/request';
import { createResponse, header } from '../response/response';
import { serialize } from '../serialize/serialize';
import { FluxifyRequest, FluxifyServer } from './boot.type';

declare global {
	// eslint-disable-next-line no-var
	var server: FluxifyServer;
}

export const bootstrap = (): FluxifyServer => {
	const options: Serve = {
		port: config.stage === 'test' ? 0 : config.port,
		development: config.stage === 'dev',
		async fetch(request: FluxifyRequest, server: Server): Promise<Response> {
			request.time = performance.now();
			request.ip = config.stage === 'test' ? '' : server.requestIP(request)?.address ?? '';
			request.id = randomUUID();

			const url = new URL(request.url);
			const method = extractMethod(request.method);
			const endpoint = url.pathname;

			req(request, method, endpoint);

			const matchingRoutes = global.server.routes.filter((route) => compareEndpoint(route, endpoint));
			const targetRoute = matchingRoutes.find((route) => compareMethod(route, method));

			const useCache =
				method === 'get' &&
				config.cacheTtl > 0 &&
				config.cacheLimit > 0 &&
				request.headers.get('cache-control')?.toLowerCase() !== 'no-cache';
			const useThrottle = config.throttleTtl > 0 && config.throttleLimit > 0;

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

			if (targetRoute) {
				try {
					if (useThrottle) {
						const entry = global.server.throttle[request.ip]?.[endpoint];
						if (entry) {
							if (entry.exp < Date.now()) {
								entry.exp = Date.now() + config.throttleTtl * 1000;
								entry.hits = 0;
							}
							entry.hits += 1;
							if (entry.hits > config.throttleLimit) {
								debug(`throttle limit on route ${endpoint}`);
								const status = 429;
								return createResponse({ status, message: 'too many requests' }, status, request, {
									'retry-after': `${Math.ceil((entry.exp - Date.now()) / 1000)}`,
								});
							}
						} else {
							if (!global.server.throttle[request.ip]) {
								global.server.throttle[request.ip] = {};
							}
							global.server.throttle[request.ip][endpoint] = {
								exp: Date.now() + config.throttleTtl * 1000,
								hits: 1,
								path: endpoint,
							};
						}
					}

					if (config.databaseMode === 'readonly' && method !== 'get') {
						throw Locked();
					}

					let param: Param | unknown = extractParam(targetRoute, endpoint);
					let query: Query | unknown = Object.fromEntries(url.searchParams);
					let body = await parseBody(request);
					let jwt: unknown | null = null;

					if (targetRoute.schema) {
						if (targetRoute.schema.jwt) {
							const token = request.headers.get('authorization');
							if (!token || !token.toLowerCase().includes('bearer ')) {
								throw Unauthorized();
							}
							jwt = targetRoute.schema.jwt.parse(verifyJwt(token.split(' ')[1]));
						}
						if (targetRoute.schema.param) param = targetRoute.schema.param.parse(param);
						if (targetRoute.schema.query) query = targetRoute.schema.query.parse(query);
						if (targetRoute.schema.body) body = targetRoute.schema.body.parse(body);
					}

					if (useCache) {
						if (global.server.cache.length > config.cacheLimit) {
							global.server.cache.shift();
						}
						global.server.cache = global.server.cache.filter((entry) => entry.exp > Date.now());
						const hit = global.server.cache.find(
							(entry) =>
								entry.url === request.url &&
								entry.jwt === (jwt as { id?: string })?.id &&
								entry.lang === request.headers.get('accept-language')?.toLowerCase(),
						);
						if (hit) {
							debug(`cache hit on route ${endpoint}`);
							return createResponse(hit.data, hit.status, request, {
								expires: new Date(hit.exp).toUTCString(),
							});
						}
					}

					const data = await targetRoute.handler({ param, query, body, jwt, req: request });
					if (data instanceof Response) {
						res(request.id, data.status, performance.now() - request.time);
						return data;
					}

					const status = targetRoute.method === 'post' ? 201 : data ? 200 : 204;
					if (useCache) {
						global.server.cache.push({
							exp: config.cacheTtl * 1000 + Date.now(),
							url: request.url,
							jwt: (jwt as { id?: string })?.id,
							lang: request.headers.get('accept-language')?.toLowerCase(),
							data,
							status,
						});
					}
					return createResponse(data, status, request);
				} catch (err) {
					if (err instanceof ValidationError) {
						const status = 400;
						return createResponse({ status, message: err.message }, status, request);
					}
					if (err instanceof HttpException) {
						const status = err.status;
						return createResponse({ status, message: err.message }, status, request);
					}
					throw {
						name: (err as { name?: string })?.name,
						message: (err as { message?: string })?.message,
						cause: (err as { cause?: string })?.cause,
						stack: (err as { stack?: string })?.stack,
						request,
					};
				}
			} else if (matchingRoutes.length > 0) {
				const status = 405;
				return createResponse({ status, message: 'method not allowed' }, status, request);
			} else {
				const status = 404;
				return createResponse({ status, message: 'not found' }, status, request);
			}
		},
		error(err: Error): Response {
			error(err?.message, config.logLevel === 'trace' ? err : '');
			const status = 500;
			return createResponse(
				{ status, message: 'internal server error' },
				status,
				(err as Error & { request: FluxifyRequest }).request,
			);
		},
	};

	info(`starting http server...`);
	info(`bun v${version} ${pack.name} v${pack.version}`);
	info(`log level is set to ${config.logLevel}`);
	info(`using database ${config.databasePath}`);
	debug(`database mode is ${config.databaseMode}`);
	debug(`global prefix is ${config.globalPrefix}`);
	if (!global.server) {
		const bunServer: Partial<FluxifyServer> = serve(options);
		bunServer.routes = routes;
		bunServer.cache = [];
		bunServer.throttle = {};
		bunServer.logger = logger;
		bunServer.header = header;
		bunServer.serialize = serialize;
		global.server = bunServer as FluxifyServer;
	} else {
		global.server.reload(options);
		global.server.routes = routes;
		global.server.cache = [];
		global.server.throttle = {};
		global.server.logger = logger;
		global.server.header = header;
		global.server.serialize = serialize;
	}

	routes.map((route, _index, array) =>
		array.filter((rout) => rout.endpoint === route.endpoint && rout.method === route.method).length > 1
			? warn(`ambiguous route ${coloredMethod(route.method)} ${bold}${route.endpoint}${reset}`)
			: debug(`mapped route ${coloredMethod(route.method)} ${bold}${route.endpoint}${reset}`),
	);
	info(`mapped ${routes.length} routes of which ${routes.filter((route) => route.schema?.jwt).length} have auth`);
	info(`listening for requests on localhost:${config.port}`);

	return global.server;
};
