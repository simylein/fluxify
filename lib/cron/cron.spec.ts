import { beforeAll, describe, expect, mock, test } from 'bun:test';
import { calc, cron, tabs } from './cron';

beforeAll(() => {
	tabs.push = mock(() => 0);
	console.error = mock(() => void 0);
});

describe(cron.name, () => {
	test('should push valid cron schedules to tabs', () => {
		const schedule = '* * * * * *';
		const handler = (): void => void 0;
		cron(schedule, handler);
		expect(tabs.push).toHaveBeenCalledTimes(1);
		expect(tabs.push).toHaveBeenCalledWith({ timer: null, schedule, handler });
	});

	test('should not push invalid cron schedules to tabs', () => {
		cron('invalid cron schedule', () => void 0);
		expect(tabs.push).toHaveBeenCalledTimes(1);
	});
});

describe(calc.name, () => {
	test('should return the distance to the next call with wildcards', () => {
		expect(calc(0, '*', 60)).toEqual(0);
		expect(calc(37, '*', 60)).toEqual(0);
		expect(calc(42, '*', 60)).toEqual(0);
		expect(calc(56, '*', 60)).toEqual(0);
	});

	test('should return the distance to the next call with numbers', () => {
		expect(calc(0, '42', 24)).toEqual(42);
		expect(calc(37, '42', 60)).toEqual(5);
		expect(calc(41, '42', 60)).toEqual(1);
		expect(calc(42, '42', 60)).toEqual(60);
		expect(calc(43, '42', 60)).toEqual(59);
		expect(calc(56, '42', 60)).toEqual(46);
	});

	test('should return the distance to the next call with ranges', () => {
		expect(calc(0, '23-37', 60)).toEqual(23);
		expect(calc(22, '23-37', 60)).toEqual(1);
		expect(calc(23, '23-37', 60)).toEqual(0);
		expect(calc(24, '23-37', 60)).toEqual(0);
		expect(calc(36, '23-37', 60)).toEqual(0);
		expect(calc(37, '23-37', 60)).toEqual(0);
		expect(calc(38, '23-37', 60)).toEqual(45);
	});

	test('should return the distance to the next call with lists', () => {
		expect(calc(0, '0,20,40', 60)).toEqual(20);
		expect(calc(1, '0,20,40', 60)).toEqual(19);
		expect(calc(19, '0,20,40', 60)).toEqual(1);
		expect(calc(20, '0,20,40', 60)).toEqual(20);
		expect(calc(21, '0,20,40', 60)).toEqual(19);
		expect(calc(39, '0,20,40', 60)).toEqual(1);
		expect(calc(40, '0,20,40', 60)).toEqual(20);
		expect(calc(41, '0,20,40', 60)).toEqual(19);
		expect(calc(59, '0,20,40', 60)).toEqual(1);
	});
});
