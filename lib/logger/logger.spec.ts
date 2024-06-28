import { afterAll, beforeAll, describe, expect, mock, test } from 'bun:test';
import { randomUUID } from 'crypto';
import { config } from '../config/config';
import { FluxifyRequest, Method, Path } from '../router/router.type';
import { expectType } from '../test/expect-type';
import { blue, bold, cyan, green, purple, red, reset, yellow } from './color';
import {
	customLogger,
	debug,
	error,
	formatTimestamp,
	getContext,
	info,
	logger,
	makeBase,
	mask,
	req,
	res,
	trace,
	warn,
} from './logger';

beforeAll(() => {
	logger({
		req: mock(() => void 0),
		res: mock(() => void 0),
		trace: mock(() => void 0),
		debug: mock(() => void 0),
		info: mock(() => void 0),
		warn: mock(() => void 0),
		error: mock(() => void 0),
	});
	config.logLevel = 'trace';
	config.logRequests = true;
	config.logResponses = true;
	console.log = mock(() => void 0);
	console.trace = mock(() => void 0);
	console.debug = mock(() => void 0);
	console.info = mock(() => void 0);
	console.warn = mock(() => void 0);
	console.error = mock(() => void 0);
});

afterAll(() => {
	logger({});
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
			`${bold}${blue}[${config.name}]${reset} (${config.stage}) ${time} ${bold}req${reset}:`,
		);
		expect(makeBase(timestamp, 'res')).toEqual(
			`${bold}${blue}[${config.name}]${reset} (${config.stage}) ${time} ${bold}res${reset}:`,
		);
		expect(makeBase(timestamp, 'trace')).toEqual(
			`${bold}${blue}[${config.name}]${reset} (${config.stage}) ${time} ${bold}${purple}trace${reset}:`,
		);
		expect(makeBase(timestamp, 'debug')).toEqual(
			`${bold}${blue}[${config.name}]${reset} (${config.stage}) ${time} ${bold}${cyan}debug${reset}:`,
		);
		expect(makeBase(timestamp, 'info')).toEqual(
			`${bold}${blue}[${config.name}]${reset} (${config.stage}) ${time} ${bold}${green}info${reset}:`,
		);
		expect(makeBase(timestamp, 'warn')).toEqual(
			`${bold}${blue}[${config.name}]${reset} (${config.stage}) ${time} ${bold}${yellow}warn${reset}:`,
		);
		expect(makeBase(timestamp, 'error')).toEqual(
			`${bold}${blue}[${config.name}]${reset} (${config.stage}) ${time} ${bold}${red}error${reset}:`,
		);
	});
});

describe(mask.name, () => {
	test('should mask a uuid', () => {
		expect(mask('22026508-7a4d-9429-4911-9bb087570f3e')).toEqual('22..3e');
		expect(mask('f68397d9-e46a-df41-70ad-65240ca80276')).toEqual('f6..76');
		expectType<string>(mask('f68397d9-e46a-df41-70ad-65240ca80276'));
	});
});

describe(req.name, () => {
	const request = { id: randomUUID(), ip: '127.0.0.1' } as FluxifyRequest;
	const method: Method = 'get';
	const endpoint: Path = '/test';
	const result = req(request, method, endpoint);
	expectType<void>(result);

	test('should call the log function on console', () => {
		expect(console.log).toHaveBeenCalledTimes(2);
		expect(console.log).toHaveBeenCalledWith(expect.stringContaining(method));
		expect(console.log).toHaveBeenCalledWith(expect.stringContaining(endpoint));
	});

	test('should call the custom logger request function', () => {
		expect(customLogger.req).toHaveBeenCalledTimes(1);
		expect(customLogger.req).toHaveBeenLastCalledWith({
			id: request.id,
			ip: request.ip,
			timestamp: expect.any(Number),
			method,
			endpoint,
		});
	});
});

describe(res.name, () => {
	const id = randomUUID();
	const status = 200;
	const time = 16;
	const result = res(id, status, time, 0);
	expectType<void>(result);

	test('should call the log function on console', () => {
		expect(console.log).toHaveBeenCalledTimes(2);
		expect(console.log).toHaveBeenCalledWith(expect.stringContaining(`${status}`));
		expect(console.log).toHaveBeenCalledWith(expect.stringContaining(`${time}`));
	});

	test('should call the custom logger response function', () => {
		expect(customLogger.res).toHaveBeenCalledTimes(1);
		expect(customLogger.res).toHaveBeenLastCalledWith({ id, timestamp: expect.any(Number), status, time, bytes: 0 });
	});
});

describe(trace.name, () => {
	const log = 'trace message';
	const result = trace(log);
	expectType<void>(result);

	test('should call the trace function on console', () => {
		expect(console.trace).toHaveBeenCalledTimes(1);
		expect(console.trace).toHaveBeenLastCalledWith(expect.stringContaining(log), '', '');
	});

	test('should call the custom logger trace function', () => {
		expect(customLogger.trace).toHaveBeenCalledTimes(1);
		expect(customLogger.trace).toHaveBeenLastCalledWith({
			timestamp: expect.any(Number),
			message: log,
			stack: undefined,
			context: import.meta.file,
		});
	});
});

describe(debug.name, () => {
	const log = 'debug message';
	const result = debug(log);
	expectType<void>(result);

	test('should call the debug function on console', () => {
		expect(console.debug).toHaveBeenCalledTimes(1);
		expect(console.debug).toHaveBeenLastCalledWith(expect.stringContaining(log));
	});

	test('should call the custom logger debug function', () => {
		expect(customLogger.debug).toHaveBeenCalledTimes(1);
		expect(customLogger.debug).toHaveBeenLastCalledWith({
			timestamp: expect.any(Number),
			message: log,
			stack: undefined,
			context: import.meta.file,
		});
	});
});

describe(info.name, () => {
	const log = 'info message';
	const result = info(log);
	expectType<void>(result);

	test('should call the info function on console', () => {
		expect(console.info).toHaveBeenCalledTimes(1);
		expect(console.info).toHaveBeenLastCalledWith(expect.stringContaining(log));
	});

	test('should call the custom logger info function', () => {
		expect(customLogger.info).toHaveBeenCalledTimes(1);
		expect(customLogger.info).toHaveBeenLastCalledWith({
			timestamp: expect.any(Number),
			message: log,
			stack: undefined,
			context: import.meta.file,
		});
	});
});

describe(warn.name, () => {
	const log = 'warn message';
	const result = warn(log);
	expectType<void>(result);

	test('should call the warn function on console', () => {
		expect(console.warn).toHaveBeenCalledTimes(1);
		expect(console.warn).toHaveBeenLastCalledWith(expect.stringContaining(log));
	});

	test('should call the custom logger warn function', () => {
		expect(customLogger.warn).toHaveBeenCalledTimes(1);
		expect(customLogger.warn).toHaveBeenLastCalledWith({
			timestamp: expect.any(Number),
			message: log,
			stack: undefined,
			context: import.meta.file,
		});
	});
});

describe(error.name, () => {
	const log = 'error message';
	const result = error(log);
	expectType<void>(result);

	test('should call the error function on console', () => {
		expect(console.error).toHaveBeenCalledTimes(1);
		expect(console.error).toHaveBeenLastCalledWith(expect.stringContaining(log), '', '');
	});

	test('should call the custom logger error function', () => {
		expect(customLogger.error).toHaveBeenCalledTimes(1);
		expect(customLogger.error).toHaveBeenLastCalledWith({
			timestamp: expect.any(Number),
			message: log,
			stack: undefined,
			context: import.meta.file,
		});
	});
});
