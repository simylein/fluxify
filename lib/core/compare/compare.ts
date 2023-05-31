import { Method, Route } from '../../router/router.type';

export const compareEndpoint = (route: Route, endpoint: string): boolean => {
	const path = route.endpoint
		.split('/')
		.map((frag, ind) =>
			frag.includes(':')
				? endpoint.split('/')?.[ind] !== undefined && endpoint.split('/')?.[ind] !== ''
					? endpoint.split('/')[ind]
					: 'null'
				: frag,
		)
		.join('/');
	return path === endpoint;
};

export const compareMethod = (route: Route, method: Method | null): boolean => {
	return route.method === method;
};
