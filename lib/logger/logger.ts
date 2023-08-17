import { config } from '../config/config';
import { Config } from '../config/config.type';
import { Method } from '../router/router.type';
import { blue, bold, coloredStatus, coloredTime, cyan, green, purple, red, reset, yellow } from './color';
import { Logger } from './logger.type';

const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

export const customLogger: Logger = {};

export const getContext = (): string | null => {
	try {
		const stackTrace = new Error().stack;
		const callerLine = stackTrace?.split('\n')[3];
		const filepath = callerLine?.split('(')[1];
		const file = filepath?.split('/').pop();
		const filename = file?.split(':')[0];
		return filename?.endsWith('.ts') ? filename : null;
	} catch {
		return null;
	}
};

export const formatTimestamp = (timestamp: number): string => {
	const date = new Date(timestamp);
	const hour = date.getHours().toString().padStart(2, '0');
	const minute = date.getMinutes().toString().padStart(2, '0');
	const second = date.getSeconds().toString().padStart(2, '0');
	return `${hour}:${minute}:${second}`;
};

export const makeBase = (timestamp: number, variant: Config['logLevel'] | 'req' | 'res'): string => {
	const name = `${bold}${blue}[${config.appName}]${reset}`;
	const stage = `${bold}(${config.stage})${reset}`;
	return `${name} ${stage} ${formatTimestamp(timestamp)} ${makeLevel(variant)}`;
};

export const makeLevel = (logLevel: Config['logLevel'] | 'req' | 'res'): string => {
	switch (true) {
		case logLevel === 'req':
			return `${bold}req${reset}:`;
		case logLevel === 'res':
			return `${bold}res${reset}:`;
		case logLevel === 'trace':
			return `${bold}${purple}trace${reset}:`;
		case logLevel === 'debug':
			return `${bold}${cyan}debug${reset}:`;
		case logLevel === 'info':
			return `${bold}${green}info${reset}:`;
		case logLevel === 'warn':
			return `${bold}${yellow}warn${reset}:`;
		case logLevel === 'error':
			return `${bold}${red}error${reset}:`;
		default:
			return `${bold}${logLevel}${reset}`;
	}
};

export const logger = (custom: Logger): void => {
	customLogger.req = custom.req;
	customLogger.res = custom.res;
	customLogger.trace = custom.trace;
	customLogger.debug = custom.debug;
	customLogger.info = custom.info;
	customLogger.warn = custom.warn;
	customLogger.error = custom.error;
};

export const mask = (uuid: string): string => {
	const length = uuid.length;
	if (length < 4) {
		return uuid;
	}
	const head = uuid.substring(0, 2);
	const tail = uuid.substring(length - 2, length);
	return `${head}..${tail}`;
};

export const req = (ip: string, method: Method, endpoint: string): void => {
	if (config.logRequests) {
		const timestamp = Date.now();
		const masked = endpoint.replace(uuidRegex, (uuid) => mask(uuid));
		console.log(`${makeBase(timestamp, 'req')} ${method} ${masked} from ${ip}`);
		if (customLogger.req) {
			void customLogger.req({ timestamp, ip, method, endpoint });
		}
	}
};

export const res = (status: number, time: number): void => {
	if (config.logResponses) {
		const timestamp = Date.now();
		console.log(`${makeBase(timestamp, 'res')} status ${coloredStatus(status)} took ${coloredTime(time)}`);
		if (customLogger.res) {
			void customLogger.res({ timestamp, status, time });
		}
	}
};

export const trace = (message: string, stack?: unknown): void => {
	const logLevels: Config['logLevel'][] = ['trace'];
	if (logLevels.includes(config.logLevel)) {
		const timestamp = Date.now();
		const context = getContext();
		console.trace(`${makeBase(timestamp, 'trace')} ${message}`, stack ?? '');
		if (customLogger.trace) {
			void customLogger.trace({ timestamp, context, message, stack });
		}
	}
};

export const debug = (message: string): void => {
	const logLevels: Config['logLevel'][] = ['trace', 'debug'];
	if (logLevels.includes(config.logLevel)) {
		const timestamp = Date.now();
		const context = getContext();
		console.debug(`${makeBase(timestamp, 'debug')} ${message}`);
		if (customLogger.debug) {
			void customLogger.debug({ timestamp, context, message });
		}
	}
};

export const info = (message: string): void => {
	const logLevels: Config['logLevel'][] = ['trace', 'debug', 'info'];
	if (logLevels.includes(config.logLevel)) {
		const timestamp = Date.now();
		const context = getContext();
		console.info(`${makeBase(timestamp, 'info')} ${message}`);
		if (customLogger.info) {
			void customLogger.info({ timestamp, context, message });
		}
	}
};

export const warn = (message: string): void => {
	const logLevels: Config['logLevel'][] = ['trace', 'debug', 'info', 'warn'];
	if (logLevels.includes(config.logLevel)) {
		const timestamp = Date.now();
		const context = getContext();
		console.warn(`${makeBase(timestamp, 'warn')} ${message}`);
		if (customLogger.warn) {
			void customLogger.warn({ timestamp, context, message });
		}
	}
};

export const error = (message: string, stack?: unknown): void => {
	const logLevels: Config['logLevel'][] = ['trace', 'debug', 'info', 'warn', 'error'];
	if (logLevels.includes(config.logLevel)) {
		const timestamp = Date.now();
		const context = getContext();
		console.error(`${makeBase(timestamp, 'error')} ${message}`, stack ?? '');
		if (customLogger.error) {
			void customLogger.error({ timestamp, context, message, stack });
		}
	}
};
