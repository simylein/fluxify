type Entry = {
	exp: number;
	hits: number;
	path: string;
};

export type Throttle = Record<string, Record<string, Entry>>;
