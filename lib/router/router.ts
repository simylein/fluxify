import { config } from '../config/config';
import { colorMethod } from '../logger/color';
import { debug, warn } from '../logger/logger';
import { FluxifyResponse, HandlerSchema, Method, Path, Route, Routes, Schema } from './router.type';

export const routes: Routes = new Map();

type Router = {
	all: <P, Q, B, J>(
		endpoint: Path,
		schema: Schema<P, Q, B, J> | null,
		handler: ({ param, query, body, jwt }: HandlerSchema<P, Q, B, J>) => FluxifyResponse,
	) => void;
	get: <P, Q, B, J>(
		endpoint: Path,
		schema: Schema<P, Q, B, J> | null,
		handler: ({ param, query, body, jwt }: HandlerSchema<P, Q, B, J>) => FluxifyResponse,
	) => void;
	post: <P, Q, B, J>(
		endpoint: Path,
		schema: Schema<P, Q, B, J> | null,
		handler: ({ param, query, body, jwt }: HandlerSchema<P, Q, B, J>) => FluxifyResponse,
	) => void;
	put: <P, Q, B, J>(
		endpoint: Path,
		schema: Schema<P, Q, B, J> | null,
		handler: ({ param, query, body, jwt }: HandlerSchema<P, Q, B, J>) => FluxifyResponse,
	) => void;
	patch: <P, Q, B, J>(
		endpoint: Path,
		schema: Schema<P, Q, B, J> | null,
		handler: ({ param, query, body, jwt }: HandlerSchema<P, Q, B, J>) => FluxifyResponse,
	) => void;
	delete: <P, Q, B, J>(
		endpoint: Path,
		schema: Schema<P, Q, B, J> | null,
		handler: ({ param, query, body, jwt }: HandlerSchema<P, Q, B, J>) => FluxifyResponse,
	) => void;
};

export const fuse = (endpoint: Path, prefix: string, version?: number, base?: Path): string => {
	const fragments: string[] = [
		typeof endpoint === 'object' && endpoint.prefix !== undefined
			? endpoint.prefix
			: typeof base === 'object' && base.prefix !== undefined
			? base.prefix
			: prefix,
		typeof endpoint === 'object' && endpoint.version
			? `v${endpoint.version}`
			: typeof base === 'object' && base.version
			? `v${base.version}`
			: version
			? `v${version}`
			: '',
		typeof base === 'object' ? base.path : base ?? '',
		typeof endpoint === 'object' ? endpoint.path : endpoint,
	];
	return (
		fragments
			.filter((frag) => frag.length)
			.map((frag) => (frag.startsWith('/') ? frag : `/${frag}`))
			.map((frag) => (frag.endsWith('/') ? frag.substring(0, frag.length - 1) : frag))
			.join('') || '/'
	);
};

export const register = (route: Route): void => {
	const frags = route.endpoint.split('/').filter((frag) => !!frag);
	const walk = (parent: Routes, ind: number): void => {
		if (ind >= frags.length) {
			if (parent.has(route.method)) {
				return warn(`ambiguous route ${colorMethod(route.method)} ${route.endpoint}`);
			}
			parent.set(route.method, route);
			return debug(`mapped route ${colorMethod(route.method)} ${route.endpoint}`);
		}
		if (!parent.has(frags[ind])) {
			parent.set(frags[ind], new Map());
		}
		const child = parent.get(frags[ind])! as Routes;
		walk(child, ind + 1);
	};
	walk(routes, 0);
};

export const traverse = (router: Routes, endpoint: string): Routes | null => {
	const frags = endpoint.split('/').filter((frag) => !!frag);
	const walk = (parent: Routes, ind: number): Routes | null => {
		if (ind >= frags.length) {
			if ([...parent.values()].every((value) => value instanceof Map)) {
				return null;
			}
			return parent;
		}
		const child = parent.get(frags[ind]) as Routes | undefined;
		if (!child) {
			for (const [key, value] of parent.entries()) {
				if (key.startsWith(':')) {
					const result = walk(value as Routes, ind + 1);
					if (result) {
						return result;
					}
				}
			}
			return null;
		}
		return walk(child, ind + 1);
	};
	return walk(router, 0);
};

export const pick = (matching: Routes | null, method: Method): Route | undefined => {
	const route = matching?.get(method === 'head' ? 'get' : method) as Route | undefined;
	if (!route) {
		return matching?.get('all') as Route | undefined;
	}
	return route;
};

export const router = (base?: Path): Router => {
	return {
		all<P, Q, B, J>(
			endpoint: Path,
			schema: Schema<P, Q, B, J> | null,
			handler: ({ param, query, body, jwt }: HandlerSchema<P, Q, B, J>) => FluxifyResponse,
		): void {
			register({
				method: 'all',
				schema,
				endpoint: fuse(endpoint, config.globalPrefix, config.defaultVersion, base),
				handler,
			});
		},

		get<P, Q, B, J>(
			endpoint: Path,
			schema: Schema<P, Q, B, J> | null,
			handler: ({ param, query, body, jwt }: HandlerSchema<P, Q, B, J>) => FluxifyResponse,
		): void {
			register({
				method: 'get',
				schema,
				endpoint: fuse(endpoint, config.globalPrefix, config.defaultVersion, base),
				handler,
			});
		},

		post<P, Q, B, J>(
			endpoint: Path,
			schema: Schema<P, Q, B, J> | null,
			handler: ({ param, query, body, jwt }: HandlerSchema<P, Q, B, J>) => FluxifyResponse,
		): void {
			register({
				method: 'post',
				schema,
				endpoint: fuse(endpoint, config.globalPrefix, config.defaultVersion, base),
				handler,
			});
		},

		put<P, Q, B, J>(
			endpoint: Path,
			schema: Schema<P, Q, B, J> | null,
			handler: ({ param, query, body, jwt }: HandlerSchema<P, Q, B, J>) => FluxifyResponse,
		): void {
			register({
				method: 'put',
				schema,
				endpoint: fuse(endpoint, config.globalPrefix, config.defaultVersion, base),
				handler,
			});
		},

		patch<P, Q, B, J>(
			endpoint: Path,
			schema: Schema<P, Q, B, J> | null,
			handler: ({ param, query, body, jwt }: HandlerSchema<P, Q, B, J>) => FluxifyResponse,
		): void {
			register({
				method: 'patch',
				schema,
				endpoint: fuse(endpoint, config.globalPrefix, config.defaultVersion, base),
				handler,
			});
		},

		delete<P, Q, B, J>(
			endpoint: Path,
			schema: Schema<P, Q, B, J> | null,
			handler: ({ param, query, body, jwt }: HandlerSchema<P, Q, B, J>) => FluxifyResponse,
		): void {
			register({
				method: 'delete',
				schema,
				endpoint: fuse(endpoint, config.globalPrefix, config.defaultVersion, base),
				handler,
			});
		},
	};
};
