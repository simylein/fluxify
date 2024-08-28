import { config } from '../config/config';
import { Method, Route } from '../router/router.type';
import { Throttle, ThrottleEntry, ThrottleOptions } from './throttle.type';

export const throttleOptions = (route: Route | undefined): ThrottleOptions => {
	const options: ThrottleOptions = {
		use: false,
		ttl: config.throttleTtl,
		limit: config.throttleLimit,
		regrow: config.throttleRegrow,
	};
	if (route?.schema?.throttle?.ttl !== undefined) options.ttl = route.schema.throttle.ttl;
	if (route?.schema?.throttle?.limit !== undefined) options.limit = route.schema.throttle.limit;
	if (route?.schema?.throttle?.regrow !== undefined) options.regrow = route.schema.throttle.regrow;
	if (options.ttl > 0 && options.limit > 0) options.use = true;
	return options;
};

export const throttleLookup = (
	throttle: Throttle,
	criteria: string,
	endpoint: string,
	method: Method,
	options: ThrottleOptions,
): ThrottleEntry => {
	if (!throttle.has(criteria)) {
		throttle.set(criteria, new Map());
	}
	const criteriaEntry = throttle.get(criteria)!;
	if (!criteriaEntry.has(endpoint)) {
		criteriaEntry.set(endpoint, new Map());
	}
	const endpointEntry = criteriaEntry.get(endpoint)!;
	if (!endpointEntry.has(method)) {
		endpointEntry.set(method, { exp: Date.now() + options.ttl * 1000, hits: 0 });
	}
	const methodEntry = endpointEntry.get(method)!;
	if (options.regrow) {
		const delta = Date.now() - (methodEntry.exp - options.ttl * 1000);
		const seeds = (options.ttl / options.regrow) * 1000;
		if (delta >= seeds) {
			const regrow = Math.floor(delta / seeds);
			methodEntry.exp += regrow * seeds;
			methodEntry.hits -= regrow;
			if (methodEntry.hits < 0) methodEntry.hits = 0;
		}
	}
	if (methodEntry.exp <= Date.now()) {
		methodEntry.exp = Date.now() + options.ttl * 1000;
		methodEntry.hits = 0;
	}
	methodEntry.hits += 1;
	return methodEntry;
};
