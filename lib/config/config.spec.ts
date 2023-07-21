import { Env } from 'bun';
import { describe, expect, test } from 'bun:test';
import { expectType } from '../test/expect-type';
import { validateConfig } from './config';
import { Config } from './config.type';

describe(validateConfig.name, () => {
	test('should throw given empty environment', () => {
		const env: Env = {
			NODE_ENV: '',
		};
		expect(() => validateConfig(env)).toThrow('config: lifecycle and node env is not defined');
		expect(() => expectType<Config>(validateConfig(env))).toThrow();
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
			cacheTtl: 0,
			cacheLimit: 0,
			databasePath: ':memory:',
			databaseMode: 'readwrite',
			logLevel: 'info',
			logRequests: false,
			logResponses: false,
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
			CACHE_TTL: '4',
			CACHE_LIMIT: '32',
			DATABASE_PATH: './database.sqlite',
			DATABASE_MODE: 'readonly',
			LOG_LEVEL: 'debug',
			LOG_REQUESTS: 'true',
			LOG_RESPONSES: 'true',
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
			cacheTtl: 4,
			cacheLimit: 32,
			databasePath: './database.sqlite',
			databaseMode: 'readonly',
			logLevel: 'debug',
			logRequests: true,
			logResponses: true,
		});
	});
});
