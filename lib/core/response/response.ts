import { config } from '../../config/config';
import { res } from '../../logger/logger';

let customHeaders: HeadersInit = {};

export const defaultHeaders = {
	server: 'bun',
	connection: 'keep-alive',
	'keep-alive': 'timeout=5',
	'content-type': 'application/json;charset=utf-8',
	'access-control-allow-origin': config.allowOrigin,
};

export const header = (custom: HeadersInit): void => {
	customHeaders = custom;
};

export const createResponse = (body: unknown | null, status: number, time: number, headers?: HeadersInit): Response => {
	const diff = performance.now() - time;
	res(status, diff);
	return new Response(body ? JSON.stringify(body) : null, {
		status,
		headers: { ...defaultHeaders, ...customHeaders, ...headers },
	});
};
