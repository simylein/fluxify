import { Parser } from '../validation/parser.type';

export type Method = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'options';

export type Param = Record<string, unknown>;

export type Query = Record<string, unknown>;

export type Route = {
	method: Method;
	schema: Schema<unknown, unknown, unknown, unknown> | null;
	endpoint: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	handler: ({ param, query, body, jwt, req, ip }: HandlerSchema<any, any, any, any>) => RouteReturn;
};

export type Schema<P, Q, B, J> = {
	param?: Parser<P>;
	query?: Parser<Q>;
	body?: Parser<B>;
	jwt?: Parser<J>;
};

export type HandlerSchema<P, Q, B, J> = {
	param: TypedParam<P>;
	query: TypedQuery<Q>;
	body: TypedBody<B>;
	jwt: TypedJwt<J>;
	req: Request;
	ip: string;
};

export type RouteReturn = Promise<unknown> | unknown;

type TypedParam<P> = P extends undefined
	? undefined
	: ReturnType<NonNullable<Schema<P, unknown, unknown, unknown>['param']>['parse']>;

type TypedQuery<Q> = Q extends undefined
	? undefined
	: ReturnType<NonNullable<Schema<unknown, Q, unknown, unknown>['query']>['parse']>;

type TypedBody<B> = B extends undefined
	? undefined
	: ReturnType<NonNullable<Schema<unknown, unknown, B, unknown>['body']>['parse']>;

type TypedJwt<J> = J extends undefined
	? undefined
	: ReturnType<NonNullable<Schema<unknown, unknown, unknown, J>['jwt']>['parse']>;
