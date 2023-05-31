import { describe, expect, test } from 'bun:test';
import { determineStage } from './stage';

describe(determineStage.name, () => {
	test('should recognise test stages and return test', () => {
		expect(determineStage('test:dev', '')).toEqual('test');
		expect(determineStage('test:prod', '')).toEqual('test');
		expect(determineStage('', 'test')).toEqual('test');
	});

	test('should recognise start stages and return dev or prod', () => {
		expect(determineStage('start:dev', '')).toEqual('dev');
		expect(determineStage('start:prod', '')).toEqual('prod');
		expect(determineStage('', 'development')).toEqual('dev');
		expect(determineStage('', 'production')).toEqual('prod');
	});

	test('should recognise schema stages and return stage', () => {
		expect(determineStage('schema:drop', '')).toEqual('stage');
		expect(determineStage('schema:sync', '')).toEqual('stage');
		expect(determineStage('schema:seed', '')).toEqual('stage');
	});

	test('should throw given unregistered stages', () => {
		expect(() => determineStage('', '')).toThrow('lifecycle and node env is not defined');
		expect(() => determineStage(undefined, '')).toThrow('lifecycle and node env is not defined');
		expect(() => determineStage('he', 'llo')).toThrow(`unknown lifecycle 'he' and node env 'llo'`);
	});
});
