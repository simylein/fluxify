export type ThrottleEntry = {
	exp: number;
	hits: number;
};

export type Throttle = Map<string, Map<string, Map<string, ThrottleEntry>>>;

export type ThrottleOptions = {
	use: boolean;
	ttl: number;
	limit: number;
};
