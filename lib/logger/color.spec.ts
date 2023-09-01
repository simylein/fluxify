import { describe, expect, test } from 'bun:test';
import {
	blue,
	bold,
	coloredMethod,
	coloredStatus,
	coloredTerminal,
	coloredTime,
	cyan,
	green,
	red,
	reset,
	yellow,
} from './color';

describe(coloredTerminal.name, () => {
	test('should return if the terminal supports color given env vars', () => {
		expect(coloredTerminal({ NODE_ENV: 'test' })).toEqual(false);
		expect(coloredTerminal({ NODE_ENV: 'test', TERM: 'color' })).toEqual(true);
		expect(coloredTerminal({ NODE_ENV: 'test', TERM: 'color', NO_COLOR: 'true' })).toEqual(false);
		expect(coloredTerminal({ NODE_ENV: 'test', TERM: 'color', NO_COLOR: 'true', FORCE_COLOR: 'true' })).toEqual(true);
		expect(coloredTerminal({ NODE_ENV: 'test', NO_COLOR: 'true' })).toEqual(false);
		expect(coloredTerminal({ NODE_ENV: 'test', FORCE_COLOR: 'true' })).toEqual(true);
	});
});

describe(coloredMethod.name, () => {
	test('should return the method with the corresponding color', () => {
		expect(coloredMethod('options')).toEqual(`${bold}${cyan}${'options'}${reset}`);
		expect(coloredMethod('get')).toEqual(`${bold}${blue}${'get'}${reset}`);
		expect(coloredMethod('post')).toEqual(`${bold}${green}${'post'}${reset}`);
		expect(coloredMethod('put')).toEqual(`${bold}${yellow}${'put'}${reset}`);
		expect(coloredMethod('patch')).toEqual(`${bold}${yellow}${'patch'}${reset}`);
		expect(coloredMethod('delete')).toEqual(`${bold}${red}${'delete'}${reset}`);
	});
});

describe(coloredStatus.name, () => {
	test('should return the status with the corresponding color', () => {
		expect(coloredStatus(601)).toEqual('601');
		expect(coloredStatus(600)).toEqual('600');
		expect(coloredStatus(501)).toEqual(`${bold}${red}501${reset}`);
		expect(coloredStatus(500)).toEqual(`${bold}${red}500${reset}`);
		expect(coloredStatus(401)).toEqual(`${bold}${yellow}401${reset}`);
		expect(coloredStatus(400)).toEqual(`${bold}${yellow}400${reset}`);
		expect(coloredStatus(301)).toEqual(`${bold}${blue}301${reset}`);
		expect(coloredStatus(300)).toEqual(`${bold}${blue}300${reset}`);
		expect(coloredStatus(201)).toEqual(`${bold}${green}201${reset}`);
		expect(coloredStatus(200)).toEqual(`${bold}${green}200${reset}`);
		expect(coloredStatus(101)).toEqual(`${bold}${cyan}101${reset}`);
		expect(coloredStatus(100)).toEqual(`${bold}${cyan}100${reset}`);
		expect(coloredStatus(99)).toEqual(`99`);
		expect(coloredStatus(0)).toEqual(`0`);
	});
});

describe(coloredTime.name, () => {
	test('should return the time with the corresponding color', () => {
		expect(coloredTime(80.1)).toEqual(`${bold}${red}80.10${reset} ms`);
		expect(coloredTime(80)).toEqual(`${bold}${yellow}80.00${reset} ms`);
		expect(coloredTime(40.1)).toEqual(`${bold}${yellow}40.10${reset} ms`);
		expect(coloredTime(40)).toEqual(`${bold}${green}40.00${reset} ms`);
		expect(coloredTime(20.1)).toEqual(`${bold}${green}20.10${reset} ms`);
		expect(coloredTime(20)).toEqual(`${bold}${cyan}20.00${reset} ms`);
		expect(coloredTime(0)).toEqual(`${bold}${cyan}0.00${reset} ms`);
		expect(coloredTime(-1)).toEqual(`${bold}${cyan}-1.00${reset} ms`);
	});
});
