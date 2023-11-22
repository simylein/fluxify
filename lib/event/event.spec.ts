import { beforeAll, describe, expect, mock, test } from 'bun:test';
import { EventEmitter } from 'events';
import { expectType } from '../test/expect-type';
import { emit, emitter, subscribe } from './event';

beforeAll(() => {
	console.debug = mock(() => void 0);
	console.info = mock(() => void 0);
	emitter.on = mock(() => new EventEmitter());
	emitter.off = mock(() => new EventEmitter());
	emitter.emit = mock(() => false);
});

describe(EventEmitter.name, () => {
	test('should have the correct instances on it', () => {
		expect(emitter).toBeInstanceOf(EventEmitter);
		expect(emitter.on).toBeInstanceOf(Function);
		expect(emitter.emit).toBeInstanceOf(Function);
	});
});

describe(subscribe.name, () => {
	test('should call the on method from the emitter', () => {
		subscribe(new Request('http://example.com'), '/test')
			.text()
			.catch(() => void 0);
		expect(emitter.on).toHaveBeenCalledTimes(1);
		expectType<Response>(subscribe(new Request('http://example.com'), '/test'));
	});

	test('should call the off method from the emitter', () => {
		const controller = new AbortController();
		subscribe(new Request('http://example.com', { signal: controller.signal }), '/test')
			.text()
			.catch(() => void 0);
		controller.abort();
		expect(emitter.off).toHaveBeenCalledTimes(1);
		expectType<Response>(subscribe(new Request('http://example.com'), '/test'));
	});
});

describe(emit.name, () => {
	test('should call the emit method from the emitter', () => {
		emit('/test');
		expect(emitter.emit).toHaveBeenCalledTimes(1);
		expectType<void>(emit('/test'));
	});
});
