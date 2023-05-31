import { serve, Serve, version } from 'bun';
import pack from '../../../package.json';
import { verifyJwt } from '../../auth/jwt';
import { config } from '../../config/config';
import { HttpException, Locked, Unauthorized } from '../../exception/exception';
import { bold, coloredMethod, reset } from '../../logger/color';
import { debug, error, info, logger, req, warn } from '../../logger/logger';
import { routes } from '../../router/router';
import { Param, Query } from '../../router/router.type';
import { ValidationError } from '../../validation/error';
import { compareEndpoint, compareMethod } from '../compare/compare';
import { extractMethod, extractParam } from '../extract/extract';
import { parseBody } from '../request/request';
import { createResponse, header } from '../response/response';
import { FluxifyServer } from './boot.type';

declare global {
	// eslint-disable-next-line no-var
	var server: FluxifyServer;
}

export const bootstrap = (): FluxifyServer => {
	const options: Serve = {
		port: config.stage === 'test' ? 0 : config.port,
		development: config.stage === 'dev',
		async fetch(request: Request): Promise<Response> {
			const time = performance.now();

			const url = new URL(request.url);
			const method = extractMethod(request.method);
			const endpoint = url.pathname;

			req(method, endpoint);

			const endpointMatches = !!routes.find((route) => compareEndpoint(route, endpoint));
			const methodMatches = !!routes.find((route) => compareMethod(route, method));
			const targetRoute = routes.find((route) => compareEndpoint(route, endpoint) && compareMethod(route, method));

			if (method === 'options') {
				const targetRoutes = routes.filter((route) => compareEndpoint(route, endpoint));
				if (targetRoutes.some((route) => route.schema?.jwt)) {
					const methods = routes
						.filter((route) => compareEndpoint(route, endpoint))
						.filter((route) => route.schema?.jwt)
						.map((route) => route.method);
					return createResponse(null, 200, time, {
						'access-control-allow-origin': config.allowOrigin,
						'access-control-allow-headers': 'authorization',
						'access-control-allow-methods': methods.join(', ').toUpperCase(),
						'access-control-allow-credentials': 'true',
					});
				} else {
					const methods = routes.filter((route) => compareEndpoint(route, endpoint)).map((route) => route.method);
					return createResponse(null, 200, time, { allow: methods.join(', ').toUpperCase() });
				}
			}

			if (endpointMatches && methodMatches && targetRoute) {
				try {
					if (config.databaseMode === 'readonly' && method !== 'get') {
						throw Locked();
					}

					let param: Param | unknown = extractParam(targetRoute, url.pathname);
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

					const data = await targetRoute.handler({ param, query, body, jwt, req: request });
					if (data instanceof Response) {
						return data;
					}
					return createResponse(data, targetRoute.method === 'post' ? 201 : data ? 200 : 204, time);
				} catch (err) {
					if (err instanceof ValidationError) {
						const status = 400;
						return createResponse({ status, message: err.message }, status, time);
					}
					if (err instanceof HttpException) {
						const status = err.status;
						return createResponse({ status, message: err.message }, status, time);
					}
					throw err;
				}
			} else if (endpointMatches) {
				const status = 405;
				return createResponse({ status, message: 'method not allowed' }, status, time);
			} else {
				const status = 404;
				return createResponse({ status, message: 'not found' }, status, time);
			}
		},
		error(err: Error): Response {
			const time = performance.now();
			error(err?.message, config.logLevel === 'trace' ? err : '');
			const status = 500;
			return createResponse({ status, message: 'internal server error' }, status, time);
		},
	};

	config.stage === 'dev' && console.clear();
	info(`starting http server...`);
	info(`bun v${version} ${pack.name} v${pack.version}`);
	info(`log level is set to ${config.logLevel}`);
	info(`using database ${config.databasePath}`);
	debug(`database mode is ${config.databaseMode}`);
	debug(`global prefix is ${config.globalPrefix}`);
	if (!global.server) {
		const bunServer: Partial<FluxifyServer> = serve(options);
		bunServer.logger = logger;
		bunServer.header = header;
		global.server = bunServer as FluxifyServer;
	} else {
		global.server.reload(options);
		global.server.logger = logger;
		global.server.header = header;
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
