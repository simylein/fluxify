import { LoggerRequest, LoggerResponse } from 'lib/logger';
import { Method } from 'lib/router';

type Endpoints = Record<string, Partial<Record<Method, number>>>;
type Responses = Record<number, number>;
type Timings = { avg: number | null; min: number | null; max: number | null };
type Metrics = { endpoints: Endpoints; responses: Responses; timings: Timings };

const metrics: Metrics = { endpoints: {}, responses: {}, timings: { avg: null, min: null, max: null } };
const entries: number[] = [];

export const logRequest = ({ method, endpoint }: LoggerRequest): void => {
	const amount = (metrics.endpoints[endpoint]?.[method] ?? 0) + 1;
	metrics.endpoints = { ...metrics.endpoints, [endpoint]: { [method]: amount } };
};

export const logResponse = ({ status, time }: LoggerResponse): void => {
	entries.push(time);
	entries.length > 100 && entries.shift();
	const amount = (metrics.responses[status] ?? 0) + 1;
	const avg = +(entries.reduce((acc, sum) => acc + sum) / entries.length).toFixed(2);
	const min = time < (metrics.timings.min ?? time + 1) ? +time.toFixed(2) : metrics.timings.min;
	const max = time > (metrics.timings.max ?? time - 1) ? +time.toFixed(2) : metrics.timings.max;
	metrics.responses = { ...metrics.responses, [status]: amount };
	metrics.timings = { avg, min, max };
};
