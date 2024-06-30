export type Cache = Map<string, Map<string, Map<string, CacheEntry>>>;

export type CacheEntry = {
	exp: number;
	data: unknown;
	status: number;
	lookups: number;
};

export type CacheOptions = {
	use: boolean;
	ttl: number;
	limit: number;
};
