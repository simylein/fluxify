import { describe, expect, test } from 'bun:test';
import {
	blue,
	bold,
	colorBytes,
	colorMethod,
	colorStatus,
	colorTerminal,
	colorTime,
	cyan,
	green,
	red,
	reset,
	yellow,
} from './color';

describe(colorTerminal.name, () => {
	test('should return if the terminal supports color given env vars', () => {
		expect(colorTerminal({ NODE_ENV: 'test' })).toEqual(false);
		expect(colorTerminal({ NODE_ENV: 'test', TERM: 'color' })).toEqual(true);
		expect(colorTerminal({ NODE_ENV: 'test', TERM: 'color', NO_COLOR: 'true' })).toEqual(false);
		expect(colorTerminal({ NODE_ENV: 'test', TERM: 'color', NO_COLOR: 'true', FORCE_COLOR: 'true' })).toEqual(true);
		expect(colorTerminal({ NODE_ENV: 'test', NO_COLOR: 'true' })).toEqual(false);
		expect(colorTerminal({ NODE_ENV: 'test', FORCE_COLOR: 'true' })).toEqual(true);
	});
});

describe(colorMethod.name, () => {
	test('should return the method with the corresponding color', () => {
		expect(colorMethod('options')).toEqual(`${bold}${cyan}${'options'}${reset}`);
		expect(colorMethod('get')).toEqual(`${bold}${blue}${'get'}${reset}`);
		expect(colorMethod('post')).toEqual(`${bold}${green}${'post'}${reset}`);
		expect(colorMethod('put')).toEqual(`${bold}${yellow}${'put'}${reset}`);
		expect(colorMethod('patch')).toEqual(`${bold}${yellow}${'patch'}${reset}`);
		expect(colorMethod('delete')).toEqual(`${bold}${red}${'delete'}${reset}`);
	});
});

describe(colorStatus.name, () => {
	test('should return the status with the corresponding color', () => {
		expect(colorStatus(601)).toEqual('601');
		expect(colorStatus(600)).toEqual('600');
		expect(colorStatus(501)).toEqual(`${bold}${red}501${reset}`);
		expect(colorStatus(500)).toEqual(`${bold}${red}500${reset}`);
		expect(colorStatus(401)).toEqual(`${bold}${yellow}401${reset}`);
		expect(colorStatus(400)).toEqual(`${bold}${yellow}400${reset}`);
		expect(colorStatus(301)).toEqual(`${bold}${blue}301${reset}`);
		expect(colorStatus(300)).toEqual(`${bold}${blue}300${reset}`);
		expect(colorStatus(201)).toEqual(`${bold}${green}201${reset}`);
		expect(colorStatus(200)).toEqual(`${bold}${green}200${reset}`);
		expect(colorStatus(101)).toEqual(`${bold}${cyan}101${reset}`);
		expect(colorStatus(100)).toEqual(`${bold}${cyan}100${reset}`);
		expect(colorStatus(99)).toEqual(`99`);
		expect(colorStatus(0)).toEqual(`0`);
	});
});

describe(colorTime.name, () => {
	test('should return the time with the corresponding color', () => {
		expect(colorTime(2000)).toEqual(`${bold}${red}2.00${reset} s`);
		expect(colorTime(500)).toEqual(`${bold}${red}500.00${reset} ms`);
		expect(colorTime(80.1)).toEqual(`${bold}${red}80.10${reset} ms`);
		expect(colorTime(80)).toEqual(`${bold}${yellow}80.00${reset} ms`);
		expect(colorTime(40.1)).toEqual(`${bold}${yellow}40.10${reset} ms`);
		expect(colorTime(40)).toEqual(`${bold}${green}40.00${reset} ms`);
		expect(colorTime(20.1)).toEqual(`${bold}${green}20.10${reset} ms`);
		expect(colorTime(20)).toEqual(`${bold}${cyan}20.00${reset} ms`);
		expect(colorTime(1)).toEqual(`${bold}${cyan}1000${reset} µs`);
		expect(colorTime(0.2)).toEqual(`${bold}${cyan}200${reset} µs`);
		expect(colorTime(0)).toEqual(`${bold}${cyan}0${reset} µs`);
	});
});

describe(colorBytes.name, () => {
	test('should return the bytes with the corresponding color', () => {
		expect(colorBytes(16777216)).toEqual(`${bold}${red}16.00${reset} mb`);
		expect(colorBytes(1048576)).toEqual(`${bold}${red}1.00${reset} mb`);
		expect(colorBytes(262144)).toEqual(`${bold}${yellow}256.00${reset} kb`);
		expect(colorBytes(65536)).toEqual(`${bold}${green}64.00${reset} kb`);
		expect(colorBytes(4096)).toEqual(`${bold}${green}4.00${reset} kb`);
		expect(colorBytes(512)).toEqual(`${bold}${cyan}512${reset} b`);
		expect(colorBytes(32)).toEqual(`${bold}${cyan}32${reset} b`);
		expect(colorBytes(0)).toEqual(`${bold}${cyan}0${reset} b`);
	});
});
