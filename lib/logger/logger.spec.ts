import { beforeAll, describe, expect, mock, test } from 'bun:test';
import { config } from '../config/config';
import { blue, bold, cyan, green, red, reset, yellow } from './color';
import {
	customLogger,
	debug,
	error,
	formatTimestamp,
	getContext,
	info,
	makeBase,
	mask,
	req,
	res,
	trace,
	warn,
} from './logger';

beforeAll(() => {
	config.logLevel = 'trace';
	config.logRequests = true;
	config.logResponses = true;
	console.log = mock(() => void 0);
	console.trace = mock(() => void 0);
	console.debug = mock(() => void 0);
	console.info = mock(() => void 0);
	console.warn = mock(() => void 0);
	console.error = mock(() => void 0);
	customLogger.req = mock(() => void 0);
	customLogger.res = mock(() => void 0);
	customLogger.trace = mock(() => void 0);
	customLogger.debug = mock(() => void 0);
	customLogger.info = mock(() => void 0);
	customLogger.warn = mock(() => void 0);
	customLogger.error = mock(() => void 0);
});

describe(getContext.name, () => {
	test('should return the calling filename if called in another function', () => {
		const closure = (): string | null => {
			const context = getContext();
			return context?.endsWith('.ts') ? context : null;
		};
		const context = closure();
		expect(context).toEqual(import.meta.file);
	});
});

describe(makeBase.name, () => {
	test('should make the logging base for each variant', () => {
		const timestamp = Date.now();
		const time = formatTimestamp(timestamp);
		expect(makeBase(timestamp, 'req')).toEqual(
			`${bold}${blue}[${config.appName}]${reset} ${bold}(${config.stage})${reset} ${time} ${bold}req${reset}:`,
		);
		expect(makeBase(timestamp, 'res')).toEqual(
			`${bold}${blue}[${config.appName}]${reset} ${bold}(${config.stage})${reset} ${time} ${bold}res${reset}:`,
		);
		expect(makeBase(timestamp, 'trace')).toEqual(
			`${bold}${blue}[${config.appName}]${reset} ${bold}(${config.stage})${reset} ${time} ${bold}trace${reset}:`,
		);
		expect(makeBase(timestamp, 'debug')).toEqual(
			`${bold}${blue}[${config.appName}]${reset} ${bold}(${config.stage})${reset} ${time} ${bold}${cyan}debug${reset}:`,
		);
		expect(makeBase(timestamp, 'info')).toEqual(
			`${bold}${blue}[${config.appName}]${reset} ${bold}(${config.stage})${reset} ${time} ${bold}${green}info${reset}:`,
		);
		expect(makeBase(timestamp, 'warn')).toEqual(
			`${bold}${blue}[${config.appName}]${reset} ${bold}(${config.stage})${reset} ${time} ${bold}${yellow}warn${reset}:`,
		);
		expect(makeBase(timestamp, 'error')).toEqual(
			`${bold}${blue}[${config.appName}]${reset} ${bold}(${config.stage})${reset} ${time} ${bold}${red}error${reset}:`,
		);
	});
});

describe(mask.name, () => {
	test('should mask a uuid', () => {
		expect(mask('22026508-7a4d-9429-4911-9bb087570f3e')).toEqual('22..3e');
		expect(mask('f68397d9-e46a-df41-70ad-65240ca80276')).toEqual('f6..76');
	});
});

describe(req.name, () => {
	test('should call the custom logger request function', () => {
		req('get', '/test');
		expect(customLogger.req).toHaveBeenCalledTimes(1);
	});
});

describe(res.name, () => {
	test('should call the custom logger response function', () => {
		res(200, 16);
		expect(customLogger.res).toHaveBeenCalledTimes(1);
	});
});

describe(trace.name, () => {
	trace('trace message');

	test('should call the trace function on console', () => {
		expect(console.trace).toHaveBeenCalledTimes(1);
	});

	test('should call the custom logger trace function', () => {
		expect(customLogger.trace).toHaveBeenCalledTimes(1);
	});
});

describe(debug.name, () => {
	debug('debug message');

	test('should call the debug function on console', () => {
		expect(console.debug).toHaveBeenCalledTimes(1);
	});

	test('should call the custom logger debug function', () => {
		expect(customLogger.debug).toHaveBeenCalledTimes(1);
	});
});

describe(info.name, () => {
	info('info message');

	test('should call the info function on console', () => {
		expect(console.info).toHaveBeenCalledTimes(1);
	});

	test('should call the custom logger info function', () => {
		expect(customLogger.info).toHaveBeenCalledTimes(1);
	});
});

describe(warn.name, () => {
	warn('warn message');

	test('should call the warn function on console', () => {
		expect(console.warn).toHaveBeenCalledTimes(1);
	});

	test('should call the custom logger warn function', () => {
		expect(customLogger.warn).toHaveBeenCalledTimes(1);
	});
});

describe(error.name, () => {
	error('error message');

	test('should call the error function on console', () => {
		expect(console.error).toHaveBeenCalledTimes(1);
	});

	test('should call the custom logger error function', () => {
		expect(customLogger.error).toHaveBeenCalledTimes(1);
	});
});
