import { config } from '../config/config';
import { HandlerSchema, Route, RouteReturn, Schema } from './router.type';

export const routes: Route[] = [];

type Router = {
	get: <P, Q, B, J>(
		endpoint: string,
		schema: Schema<P, Q, B, J> | null,
		handler: ({ param, query, body, jwt }: HandlerSchema<P, Q, B, J>) => RouteReturn,
	) => void;
	post: <P, Q, B, J>(
		endpoint: string,
		schema: Schema<P, Q, B, J> | null,
		handler: ({ param, query, body, jwt }: HandlerSchema<P, Q, B, J>) => RouteReturn,
	) => void;
	put: <P, Q, B, J>(
		endpoint: string,
		schema: Schema<P, Q, B, J> | null,
		handler: ({ param, query, body, jwt }: HandlerSchema<P, Q, B, J>) => RouteReturn,
	) => void;
	patch: <P, Q, B, J>(
		endpoint: string,
		schema: Schema<P, Q, B, J> | null,
		handler: ({ param, query, body, jwt }: HandlerSchema<P, Q, B, J>) => RouteReturn,
	) => void;
	delete: <P, Q, B, J>(
		endpoint: string,
		schema: Schema<P, Q, B, J> | null,
		handler: ({ param, query, body, jwt }: HandlerSchema<P, Q, B, J>) => RouteReturn,
	) => void;
};

export const fuseEndpoint = (endpoint: string, prefix?: string, base?: string): string => {
	const fragments: string[] = [];
	if (prefix) fragments.push(prefix.endsWith('/') ? prefix.substring(0, prefix.length - 1) : prefix);
	if (base) fragments.push(base.endsWith('/') ? base.substring(0, base.length - 1) : base);
	fragments.push(endpoint.endsWith('/') ? endpoint.substring(0, endpoint.length - 1) : endpoint);
	return (
		fragments
			.filter((frag) => frag.length)
			.map((frag) => (frag.startsWith('/') ? frag : `/${frag}`))
			.join('') || '/'
	);
};

export const router = (base?: string): Router => {
	return {
		get<P, Q, B, J>(
			endpoint: string,
			schema: Schema<P, Q, B, J> | null,
			handler: ({ param, query, body, jwt }: HandlerSchema<P, Q, B, J>) => RouteReturn,
		): void {
			routes.push({ method: 'get', schema, endpoint: fuseEndpoint(endpoint, config.globalPrefix, base), handler });
		},

		post<P, Q, B, J>(
			endpoint: string,
			schema: Schema<P, Q, B, J> | null,
			handler: ({ param, query, body, jwt }: HandlerSchema<P, Q, B, J>) => RouteReturn,
		): void {
			routes.push({ method: 'post', schema, endpoint: fuseEndpoint(endpoint, config.globalPrefix, base), handler });
		},

		put<P, Q, B, J>(
			endpoint: string,
			schema: Schema<P, Q, B, J> | null,
			handler: ({ param, query, body, jwt }: HandlerSchema<P, Q, B, J>) => RouteReturn,
		): void {
			routes.push({ method: 'put', schema, endpoint: fuseEndpoint(endpoint, config.globalPrefix, base), handler });
		},

		patch<P, Q, B, J>(
			endpoint: string,
			schema: Schema<P, Q, B, J> | null,
			handler: ({ param, query, body, jwt }: HandlerSchema<P, Q, B, J>) => RouteReturn,
		): void {
			routes.push({ method: 'patch', schema, endpoint: fuseEndpoint(endpoint, config.globalPrefix, base), handler });
		},

		delete<P, Q, B, J>(
			endpoint: string,
			schema: Schema<P, Q, B, J> | null,
			handler: ({ param, query, body, jwt }: HandlerSchema<P, Q, B, J>) => RouteReturn,
		): void {
			routes.push({ method: 'delete', schema, endpoint: fuseEndpoint(endpoint, config.globalPrefix, base), handler });
		},
	};
};
