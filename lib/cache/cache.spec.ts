import { describe, expect, mock, test } from 'bun:test';
import { config } from '../config/config';
import { FluxifyRequest, Route } from '../router/router.type';
import { cacheId, cacheInsert, cacheLang, cacheLfu, cacheLookup, cacheOptions } from './cache';

config.cacheTtl = 4;
config.cacheLimit = 8;
Date.now = mock(() => 42000);

const id = '36e12dd6-4efb-16c7-97d4-80a58b193540';
const jwt = { id };
const lang = 'en';
const entry = { exp: config.cacheTtl * 1000 + Date.now(), data: { hello: 'there' }, status: 200, lookups: 0 };
const request = new Request('http://example.com', { headers: { 'accept-language': lang } }) as FluxifyRequest;

const mapObject = (map: Map<string, unknown>): Record<string, unknown> => {
	const object: Record<string, unknown> = {};
	for (const [key, value] of map.entries()) {
		object[key] = value instanceof Map ? mapObject(value) : value;
	}
	return object;
};

describe(cacheId.name, () => {
	test('should return the jwt id given one', () => {
		expect(cacheId({ id })).toEqual(id);
	});

	test('should return public given no jwt id', () => {
		expect(cacheId(null)).toEqual('public');
	});
});

describe(cacheLang.name, () => {
	test('should return the lang given one in the request headers', () => {
		expect(cacheLang(request)).toEqual(lang);
	});

	test('should return global given no language in the request headers', () => {
		const req = request.clone() as FluxifyRequest;
		req.headers.delete('accept-language');
		expect(cacheLang(req)).toEqual('global');
	});
});

describe(cacheOptions.name, () => {
	test('should enable global cache options by default', () => {
		const route = {} as Route;
		expect(cacheOptions(request, route)).toEqual({ use: true, ttl: 4, limit: 8 });
	});

	test('should enable custom cache options when overriding them in route', () => {
		const route = { schema: { cache: { ttl: 60 } } } as Route;
		expect(cacheOptions(request, route)).toEqual({ use: true, ttl: 60, limit: 8 });
	});

	test('should disable custom cache options when overriding them in route', () => {
		const route = { schema: { cache: { ttl: 0 } } } as Route;
		expect(cacheOptions(request, route)).toEqual({ use: false, ttl: 0, limit: 8 });
	});
});

describe(cacheLookup.name, () => {
	test('should return null given no entries in the cache', () => {
		const cache = new Map();
		expect(cacheLookup(cache, request, null)).toBeNull();
	});

	test('should return null given no map children entries in the cache', () => {
		const urls = new Map();
		urls.set('http://example.com', new Map());
		expect(cacheLookup(urls, request, null)).toBeNull();
	});

	test('should return null given no nested map children entries in the cache', () => {
		const ids = new Map();
		ids.set(jwt.id, new Map());
		const urls = new Map();
		urls.set(request.url, new Map());
		expect(cacheLookup(urls, request, null)).toBeNull();
	});

	test('should return null given no deeply nested map children entries in the cache', () => {
		const langs = new Map();
		langs.set(lang, new Map());
		const ids = new Map();
		ids.set(jwt.id, langs);
		const urls = new Map();
		urls.set(request.url, ids);
		expect(cacheLookup(urls, request, jwt)).toBeNull();
	});

	test('should return null given no matching entries in the cache', () => {
		const langs = new Map();
		langs.set('de', entry);
		const ids = new Map();
		ids.set(jwt.id, langs);
		const urls = new Map();
		urls.set(request.url, ids);
		expect(cacheLookup(urls, request, jwt)).toBeNull();
	});

	test('should return null given matching but expired entries in the cache', () => {
		const langs = new Map();
		langs.set(lang, { ...entry, exp: Date.now() });
		const ids = new Map();
		ids.set(jwt.id, langs);
		const urls = new Map();
		urls.set(request.url, ids);
		expect(cacheLookup(urls, request, jwt)).toBeNull();
	});

	test('should return the matching cache entry given one in the cache', () => {
		const langs = new Map();
		langs.set(lang, entry);
		const ids = new Map();
		ids.set(jwt.id, langs);
		const urls = new Map();
		urls.set(request.url, ids);
		expect(cacheLookup(urls, request, jwt)).toEqual(entry);
	});
});

describe(cacheInsert.name, () => {
	test('should insert the new cache entry on blank cache', () => {
		const urls = new Map();
		const status = 200;
		const data = { hello: 'there' };
		expect(mapObject(cacheInsert(urls, request, jwt, config.cacheTtl, data, status))).toEqual({
			[request.url]: { [jwt.id]: { [lang]: { exp: Date.now() + config.cacheTtl * 1000, data, status, lookups: 0 } } },
		});
	});

	test('should insert the new cache entry on nested cache', () => {
		const ids = new Map();
		const urls = new Map();
		urls.set(request.url, ids);
		expect(mapObject(cacheInsert(urls, request, jwt, config.cacheTtl, entry.data, entry.status))).toEqual({
			[request.url]: {
				[jwt.id]: {
					[lang]: {
						exp: Date.now() + config.cacheTtl * 1000,
						data: entry.data,
						status: entry.status,
						lookups: 0,
					},
				},
			},
		});
	});

	test('should insert the new cache entry on deeply nested cache', () => {
		const langs = new Map();
		const ids = new Map();
		ids.set(jwt.id, langs);
		const urls = new Map();
		urls.set(request.url, ids);
		expect(mapObject(cacheInsert(urls, request, jwt, config.cacheTtl, entry.data, entry.status))).toEqual({
			[request.url]: {
				[jwt.id]: {
					[lang]: {
						exp: Date.now() + config.cacheTtl * 1000,
						data: entry.data,
						status: entry.status,
						lookups: 0,
					},
				},
			},
		});
	});
});

describe(cacheLfu.name, () => {
	test('should return null given no cache entries', () => {
		const urls = new Map();
		expect(cacheLfu(urls)).toBeNull();
	});

	test('should return null given only nested cache entries', () => {
		const ids = new Map();
		const urls = new Map();
		urls.set(request.url, ids);
		expect(cacheLfu(urls)).toBeNull();
	});

	test('should return null given only deeply nested cache entries', () => {
		const langs = new Map();
		const ids = new Map();
		ids.set(jwt.id, langs);
		const urls = new Map();
		urls.set(request.url, ids);
		expect(cacheLfu(urls)).toBeNull();
	});

	test('should return null given only entries with zero lookups', () => {
		const langs = new Map();
		langs.set('en', { lookups: 0 });
		const ids = new Map();
		ids.set(jwt.id, langs);
		const urls = new Map();
		urls.set(request.url, ids);
		expect(cacheLfu(urls)).toBeNull();
	});

	test('should return the auth me endpoint given it has the least lookups', () => {
		const high = '/todo';
		const medium = '/todo/uuid';
		const low = '/auth/me';

		const highLangs = new Map();
		highLangs.set('en', { lookups: 7 });
		const mediumLangs = new Map();
		mediumLangs.set('en', { lookups: 4 });
		const lowLangs = new Map();
		lowLangs.set('en', { lookups: 2 });

		const highIds = new Map();
		highIds.set(jwt.id, highLangs);
		const mediumIds = new Map();
		mediumIds.set(jwt.id, mediumLangs);
		const lowIds = new Map();
		lowIds.set(jwt.id, lowLangs);

		const urls = new Map();
		urls.set(high, highIds);
		urls.set(medium, mediumIds);
		urls.set(low, lowIds);

		expect(cacheLfu(urls)).toEqual(low);
	});
});
