import { Server } from 'bun';
import { Cache } from '../../cache/cache.type';
import { Tab } from '../../cron/cron.type';
import { Logger } from '../../logger/logger.type';
import { Routes } from '../../router/router.type';
import { Throttle } from '../../throttle/throttle.type';
import { Serializer } from '../serialize/serialize.type';

export type FluxifyServer = Server & {
	routes: Routes;
	tabs: Tab[];
	cache: Cache;
	throttle: Throttle;
	logger: (custom: Logger) => void;
	header: (custom: Record<string, string>) => void;
	serialize: (custom: Partial<Serializer>) => void;
};
