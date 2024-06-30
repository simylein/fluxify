import { config } from '../config/config';
import { FluxifyRequest, Responses, Route } from '../router/router.type';
import { Cache, CacheEntry, CacheOptions } from './cache.type';

export const cacheId = (jwt: unknown): string | 'public' => {
	return (jwt as { id?: string })?.id ?? 'public';
};

export const cacheLang = (request: FluxifyRequest): string | 'global' => {
	return request.headers.get('accept-language')?.toLowerCase() ?? 'global';
};

export const cacheOptions = (request: FluxifyRequest, route: Route | undefined): CacheOptions => {
	const options: CacheOptions = { use: false, ttl: config.cacheTtl, limit: config.cacheLimit };
	if (route?.schema?.cache?.ttl !== undefined) options.ttl = route.schema.cache.ttl;
	if (
		options.ttl > 0 &&
		options.limit > 0 &&
		request.method.toLowerCase() === 'get' &&
		request.headers.get('cache-control')?.toLowerCase() !== 'no-cache'
	) {
		options.use = true;
	}
	return options;
};

export const cacheLookup = (cache: Cache, request: FluxifyRequest, jwt: unknown): CacheEntry | null => {
	const id = cacheId(jwt);
	const lang = cacheLang(request);
	const urlEntry = cache.get(request.url);
	if (!urlEntry) {
		return null;
	}
	const idEntry = urlEntry.get(id);
	if (!idEntry) {
		return null;
	}
	const langEntry = idEntry.get(lang);
	if (!langEntry) {
		return null;
	}
	if (langEntry.exp > Date.now()) {
		langEntry.lookups += 1;
		return langEntry;
	} else {
		idEntry.delete(lang);
		if (idEntry.size === 0) {
			urlEntry.delete(id);
		}
	}
	return null;
};

export const cacheInsert = (
	cache: Cache,
	request: FluxifyRequest,
	jwt: unknown,
	ttl: number,
	data: Responses,
	status: number,
): Cache => {
	const id = cacheId(jwt);
	const lang = cacheLang(request);
	if (!cache.has(request.url)) {
		cache.set(request.url, new Map());
	}
	const urlEntry = cache.get(request.url)!;
	if (!urlEntry.has(id)) {
		urlEntry.set(id, new Map());
	}
	const idEntry = urlEntry.get(id)!;
	idEntry.set(lang, { exp: ttl * 1000 + Date.now(), data, status, lookups: 0 });
	return cache;
};

export const cacheLfu = (cache: Cache): string | null => {
	let lfu: string | null = null;
	let lowest = Infinity;
	cache.forEach((urls, url) => {
		let lookups = 0;
		urls.forEach((ids) => {
			ids.forEach((entry) => {
				lookups += entry.lookups;
			});
		});
		if (lookups < lowest) {
			lowest = lookups;
			lfu = url;
		}
	});
	if (lowest < Infinity && lowest !== 0) {
		return lfu;
	}
	return null;
};
