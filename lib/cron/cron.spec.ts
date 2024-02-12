import { beforeAll, describe, expect, mock, test } from 'bun:test';
import { cron, match, tabs } from './cron';

beforeAll(() => {
	tabs.push = mock(() => 0);
});

describe(cron.name, () => {
	test('should push valid cron schedules to tabs', () => {
		cron('* * * * * *', () => void 0);
		expect(tabs.push).toHaveBeenCalledTimes(1);
	});

	test('should not push invalid cron schedules to tabs', () => {
		cron('invalid cron schedule', () => void 0);
		expect(tabs.push).toHaveBeenCalledTimes(1);
	});
});

describe(match.name, () => {
	test('should match wildcard to any number', () => {
		expect(match('*', 0)).toEqual(true);
		expect(match('*', 42)).toEqual(true);
		expect(match('*', 73)).toEqual(true);
	});

	test('should match number to same number', () => {
		expect(match('0', 0)).toEqual(true);
		expect(match('42', 42)).toEqual(true);
		expect(match('64', 73)).toEqual(false);
	});

	test('should match range to including number', () => {
		expect(match('0-5', 0)).toEqual(true);
		expect(match('20-50', 42)).toEqual(true);
		expect(match('64-70', 73)).toEqual(false);
	});

	test('should match list to including number', () => {
		expect(match('0,1,2', 0)).toEqual(true);
		expect(match('41,42,43', 42)).toEqual(true);
		expect(match('70,71,72', 73)).toEqual(false);
	});
});
