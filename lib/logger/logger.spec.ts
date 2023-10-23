import { Mock, beforeAll, describe, expect, mock, test } from 'bun:test';
import { randomUUID } from 'crypto';
import { config } from '../config/config';
import { FluxifyRequest } from '../core/boot/boot.type';
import { expectType } from '../test/expect-type';
import { blue, bold, cyan, green, purple, red, reset, yellow } from './color';
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
	test('should call the custom logger request function', () => {
		const request = { id: randomUUID(), ip: '127.0.0.1' } as FluxifyRequest;
		const result = req(request, 'get', '/test');
		expectType<void>(result);
		expect(customLogger.req).toHaveBeenCalledTimes(1);
		expect((customLogger.req as Mock<() => void>).mock.calls[0]).toEqual([
			{ id: request.id, ip: request.ip, timestamp: expect.any(Number), method: 'get', endpoint: '/test' },
		]);
	});
});

describe(res.name, () => {
	test('should call the custom logger response function', () => {
		const id = randomUUID();
		const result = res(id, 200, 16);
		expectType<void>(result);
		expect(customLogger.res).toHaveBeenCalledTimes(1);
		expect((customLogger.res as Mock<() => void>).mock.calls[0]).toEqual([
			{ id, timestamp: expect.any(Number), status: 200, time: 16 },
		]);
	});
});

describe(trace.name, () => {
	const log = 'trace message';
	const result = trace(log);
	expectType<void>(result);

	test('should call the trace function on console', () => {
		expect(console.trace).toHaveBeenCalledTimes(1);
		expect((console.trace as Mock<() => void>).mock.calls[0]).toSatisfy((args) => (args as string[])[0].includes(log));
	});

	test('should call the custom logger trace function', () => {
		expect(customLogger.trace).toHaveBeenCalledTimes(1);
		expect((customLogger.trace as Mock<() => void>).mock.calls[0]).toEqual([
			{ timestamp: expect.any(Number), message: log, stack: undefined, context: import.meta.file },
		]);
	});
});

describe(debug.name, () => {
	const log = 'debug message';
	const result = debug(log);
	expectType<void>(result);

	test('should call the debug function on console', () => {
		expect(console.debug).toHaveBeenCalledTimes(1);
		expect((console.debug as Mock<() => void>).mock.calls[0]).toSatisfy((args) => (args as string[])[0].includes(log));
	});

	test('should call the custom logger debug function', () => {
		expect(customLogger.debug).toHaveBeenCalledTimes(1);
		expect((customLogger.debug as Mock<() => void>).mock.calls[0]).toEqual([
			{ timestamp: expect.any(Number), message: log, stack: undefined, context: import.meta.file },
		]);
	});
});

describe(info.name, () => {
	const log = 'info message';
	const result = info(log);
	expectType<void>(result);

	test('should call the info function on console', () => {
		expect(console.info).toHaveBeenCalledTimes(1);
		expect((console.info as Mock<() => void>).mock.calls[0]).toSatisfy((args) => (args as string[])[0].includes(log));
	});

	test('should call the custom logger info function', () => {
		expect(customLogger.info).toHaveBeenCalledTimes(1);
		expect((customLogger.info as Mock<() => void>).mock.calls[0]).toEqual([
			{ timestamp: expect.any(Number), message: log, stack: undefined, context: import.meta.file },
		]);
	});
});

describe(warn.name, () => {
	const log = 'warn message';
	const result = warn(log);
	expectType<void>(result);

	test('should call the warn function on console', () => {
		expect(console.warn).toHaveBeenCalledTimes(1);
		expect((console.warn as Mock<() => void>).mock.calls[0]).toSatisfy((args) => (args as string[])[0].includes(log));
	});

	test('should call the custom logger warn function', () => {
		expect(customLogger.warn).toHaveBeenCalledTimes(1);
		expect((customLogger.warn as Mock<() => void>).mock.calls[0]).toEqual([
			{ timestamp: expect.any(Number), message: log, stack: undefined, context: import.meta.file },
		]);
	});
});

describe(error.name, () => {
	const log = 'error message';
	const result = error(log);
	expectType<void>(result);

	test('should call the error function on console', () => {
		expect(console.error).toHaveBeenCalledTimes(1);
		expect((console.error as Mock<() => void>).mock.calls[0]).toSatisfy((args) => (args as string[])[0].includes(log));
	});

	test('should call the custom logger error function', () => {
		expect(customLogger.error).toHaveBeenCalledTimes(1);
		expect((customLogger.error as Mock<() => void>).mock.calls[0]).toEqual([
			{ timestamp: expect.any(Number), message: log, stack: undefined, context: import.meta.file },
		]);
	});
});
