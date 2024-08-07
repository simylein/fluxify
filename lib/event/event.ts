import EventEmitter from 'events';
import { customHeaders, defaultHeaders } from '../core/response/response';
import { debug, trace } from '../logger/logger';

export const emitter = new EventEmitter();
emitter.setMaxListeners(2048);

export const subscribe = (req: Request, channel: string, event?: string, data?: unknown): Response => {
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
				debug(`subscribing to ${channel}`);
				emitter.on(channel, handler);
				req.signal.onabort = () => {
					debug(`unsubscribing from ${channel}`);
					emitter.off(channel, handler);
				};
				void handler(event ?? 'connect', data);
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
	trace(`emitting to ${channel}`);
	emitter.emit(channel, event, data);
};
