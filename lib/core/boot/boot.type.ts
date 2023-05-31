import { Server } from 'bun';
import { Logger } from '../../logger/logger.type';

export type FluxifyServer = Server & {
	logger: (custom: Logger) => void;
	header: (custom: HeadersInit) => void;
};
