type Entry = {
	exp: number;
	hits: number;
	path: string;
};

export type Throttle = Record<string, Record<string, Entry>>;

export type ThrottleOptions = {
	use: boolean;
	ttl: number;
	limit: number;
};
