import { config } from '../config/config';
import { Method, Route } from '../router/router.type';
import { Throttle, ThrottleEntry, ThrottleOptions } from './throttle.type';

export const throttleOptions = (route: Route | undefined): ThrottleOptions => {
	const options: ThrottleOptions = { use: false, ttl: config.throttleTtl, limit: config.throttleLimit };
	if (route?.schema?.throttle?.ttl !== undefined) options.ttl = route.schema.throttle.ttl;
	if (route?.schema?.throttle?.limit !== undefined) options.limit = route.schema.throttle.limit;
	if (options.ttl > 0 && options.limit > 0) options.use = true;
	return options;
};

export const throttleLookup = (
	throttle: Throttle,
	criteria: string,
	endpoint: string,
	method: Method,
	ttl: number,
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
		endpointEntry.set(method, { exp: Date.now() + ttl * 1000, hits: 0 });
	}
	const methodEntry = endpointEntry.get(method)!;
	if (methodEntry.exp <= Date.now()) {
		methodEntry.exp = Date.now() + ttl * 1000;
		methodEntry.hits = 0;
	}
	methodEntry.hits += 1;
	return methodEntry;
};
