import { Serializer } from './serialize.type';

export const serializer: Serializer = {
	req: (request) => request.json(),
	res: (body) => JSON.stringify(body),
};

export const serialize = (custom: Partial<Serializer>): void => {
	if (custom.req) serializer.req = custom.req;
	if (custom.res) serializer.res = custom.res;
};
