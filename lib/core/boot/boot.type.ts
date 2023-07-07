import { Server } from 'bun';
import { Cache } from '../../cache/cache.type';
import { Logger } from '../../logger/logger.type';
import { Route } from '../../router/router.type';

export type FluxifyServer = Server & {
	routes: Route[];
	cache: Cache[];
	logger: (custom: Logger) => void;
	header: (custom: HeadersInit) => void;
};
