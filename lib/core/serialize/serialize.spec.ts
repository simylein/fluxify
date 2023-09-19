import { afterEach, describe, expect, test } from 'bun:test';
import { serialize, serializer } from './serialize';

afterEach(() => {
	serialize({
		req: (request) => request.json(),
		res: (body) => JSON.stringify(body),
	});
});

describe(serialize.name, () => {
	test('should override the default request serializer', () => {
		const data = 'hello';
		serialize({ req: () => data });
		const request = new Request('http://example.com');
		expect(serializer.req(request)).toEqual(data);
	});

	test('should override the default response serializer', () => {
		const data = 'world';
		serialize({ res: () => data });
		expect(serializer.res(data)).toEqual(data);
	});
});

describe(serializer.req.name, () => {
	test('should default to json serialization', async () => {
		const data = { hello: 'world' };
		const request = new Request('http://example.com', { body: JSON.stringify(data) });
		expect(await serializer.req(request)).toEqual(data);
	});
});

describe(serializer.res.name, () => {
	test('should default to json serialization', () => {
		const data = { hello: 'world' };
		expect(serializer.res(data)).toEqual(JSON.stringify(data));
	});
});
