import { debug, error } from '../logger/logger';
import { Tab } from './cron.type';

export const tabs: Tab[] = [];

export const cron = (schedule: Tab['schedule'], handler: Tab['handler']): void => {
	if (!schedule.match(/^(\d|\d-\d|\d(,\d)+|\*)( (\d+|\d+-\d+|\d+(,\d+)+|\*)){5}$/)) {
		return error('invalid cron schedule', schedule);
	}
	tabs.push({ timer: null, schedule, handler });
};

export const run = async (tab: Tab): Promise<void> => {
	debug(`running cron schedule ${tab.schedule}`);
	try {
		await tab.handler();
	} catch (err) {
		error(`failed to run cron schedule ${tab.schedule}`, err);
	}
};

export const plan = (tab: Tab): number => {
	const [now, next] = [new Date(), new Date()];
	const [weekday, month, day, hour, minute, second] = tab.schedule.split(' ');

	next.setMilliseconds(0);
	next.setSeconds(now.getSeconds() + 1);

	next.setSeconds(next.getSeconds() + calc(next.getSeconds(), second, 60));
	next.setMinutes(next.getMinutes() + calc(next.getMinutes(), minute, 60));
	next.setHours(next.getHours() + calc(next.getHours(), hour, 24));
	next.setDate(next.getDate() + calc(next.getDate(), day, 31));
	next.setMonth(next.getMonth() + calc(next.getMonth(), month, 12));

	void weekday;

	return next.getTime() - now.getTime();
};

export const calc = (value: number, field: string, max: number): number => {
	if (field === '*') {
		return 0;
	}
	if (field.match(/^\d+$/)) {
		const target = +field;
		if (value < target) {
			return target - value;
		} else {
			return max - value + target;
		}
	}
	if (field.match(/^\d+-\d+$/)) {
		const [start, stop] = field.split('-').map((frag) => +frag);
		if (value >= start && value <= stop) {
			return 0;
		} else if (value < start) {
			return start - value;
		} else {
			return max - value + start;
		}
	}
	if (field.match(/^\d+(,\d+)+$/)) {
		const targets = field.split(',').map((frag) => +frag);
		for (let ind = 0; ind < targets.length; ind++) {
			if (value < targets[ind]) {
				return targets[ind] - value;
			}
		}
		return max - value + targets[0];
	}
	throw Error(`unsupported crontab fragment ${field}`);
};
