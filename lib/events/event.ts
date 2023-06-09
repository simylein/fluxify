import EventEmitter from 'events';
import { debug, info } from '../logger/logger';

export const emitter = new EventEmitter();

export const subscribe = (req: Request, channel: string): Response => {
	info(`subscribing to channel '${channel}'`);
	return new Response(
		new ReadableStream({
			type: 'direct',
			pull(controller: ReadableStreamDirectController) {
				let id = +(req.headers.get('last-event-id') ?? 1);
				const handler = async (data: unknown): Promise<void> => {
					await controller.write(`id:${id}\ndata:${data !== undefined ? JSON.stringify(data) : ''}\n\n`);
					await controller.flush();
					id++;
				};
				emitter.on(channel, handler);
				if (req.signal.aborted) {
					info(`unsubscribing from channel '${channel}'`);
					emitter.off(channel, handler);
					controller.close();
				}
				return new Promise(() => void 0);
			},
		}),
		{
			status: 200,
			headers: { 'content-type': 'text/event-stream' },
		},
	);
};

export const emit = (channel: string, data?: unknown): void => {
	debug(`emitting to channel '${channel}'`);
	emitter.emit(channel, data);
};
