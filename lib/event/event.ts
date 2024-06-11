import EventEmitter from 'events';
import { customHeaders, defaultHeaders } from '../core/response/response';
import { debug, info } from '../logger/logger';

export const emitter = new EventEmitter();
emitter.setMaxListeners(2048);

export const subscribe = (req: Request, channel: string, data?: unknown): Response => {
	return new Response(
		new ReadableStream({
			type: 'direct',
			pull(controller: ReadableStreamDirectController) {
				let id = +(req.headers.get('last-event-id') ?? 0);
				const handler = async (ev: string, dat: unknown): Promise<void> => {
					await controller.write(`id:${id}\nevent:${ev}\ndata:${dat !== undefined ? JSON.stringify(dat) : ''}\n\n`);
					await controller.flush();
					id++;
				};
				info(`subscribing to channel '${channel}'`);
				emitter.on(channel, handler);
				req.signal.onabort = () => {
					info(`unsubscribing from channel '${channel}'`);
					emitter.off(channel, handler);
				};
				void handler('connect', data);
				return new Promise(() => void 0);
			},
		}),
		{
			status: 200,
			headers: { ...defaultHeaders, ...customHeaders, 'content-type': 'text/event-stream;charset=utf-8' },
		},
	);
};

export const emit = (channel: string, event: string, data?: unknown): void => {
	debug(`emitting to channel '${channel}'`);
	emitter.emit(channel, event, data);
};
