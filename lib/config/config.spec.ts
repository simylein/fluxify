import { Env } from 'bun';
import { describe, expect, test } from 'bun:test';
import { validateConfig } from './config';

describe(validateConfig.name, () => {
	test('should throw given empty environment', () => {
		const env: Env = {
			NODE_ENV: '',
		};
		expect(() => validateConfig(env)).toThrow('config: lifecycle and node env is not defined');
	});

	test('should validate and return the default config', () => {
		const env: Env = {
			NODE_ENV: '',
			STAGE: 'test',
			JWT_SECRET: 'secret',
			npm_lifecycle_event: 'test',
		};
		expect(validateConfig(env)).toEqual({
			port: 4000,
			stage: 'test',
			appName: 'fluxify',
			allowOrigin: '*',
			globalPrefix: '',
			jwtSecret: 'secret',
			jwtExpiry: 1600,
			databasePath: ':memory:',
			databaseMode: 'readwrite',
			logLevel: 'info',
			logRequests: true,
			logResponses: true,
		});
	});

	test('should validate and return the custom config', () => {
		const env: Env = {
			NODE_ENV: '',
			PORT: '8000',
			STAGE: 'test',
			APP_NAME: 'hello',
			ALLOW_ORIGIN: 'localhost',
			GLOBAL_PREFIX: '/api',
			JWT_SECRET: 'secret',
			JWT_EXPIRY: '1600',
			DATABASE_PATH: './database.sqlite',
			DATABASE_MODE: 'readonly',
			LOG_LEVEL: 'debug',
			LOG_REQUESTS: 'false',
			LOG_RESPONSES: 'false',
			npm_lifecycle_event: 'test',
		};
		expect(validateConfig(env)).toEqual({
			port: 8000,
			stage: 'test',
			appName: 'hello',
			allowOrigin: 'localhost',
			globalPrefix: '/api',
			jwtSecret: 'secret',
			jwtExpiry: 1600,
			databasePath: './database.sqlite',
			databaseMode: 'readonly',
			logLevel: 'debug',
			logRequests: false,
			logResponses: false,
		});
	});
});
