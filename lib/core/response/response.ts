import { config } from '../../config/config';
import { res } from '../../logger/logger';
import { FluxifyRequest } from '../boot/boot.type';
import { serializer } from '../serialize/serialize';

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

export const createResponse = (
	body: unknown | null,
	status: number,
	request: FluxifyRequest,
	headers?: HeadersInit,
): Response => {
	const data = body ? serializer.res(body) : null;
	const diff = performance.now() - request.time;
	res(request.id, status, diff);
	return new Response(data, { status, headers: { ...defaultHeaders, ...customHeaders, ...headers } });
};
