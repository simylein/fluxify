import { randomBytes } from 'crypto';
import { readFileSync } from 'fs';
import { boolean } from '../validation/boolean/boolean';
import { number } from '../validation/number/number';
import { object } from '../validation/object/object';
import { string } from '../validation/string/string';
import { union } from '../validation/union/union';
import { Config, Env } from './config.type';
import { determineStage } from './stage';

// TODO: remove as not needed when using const
let validatedConfig: Config;

export const validateConfig = (env: Env): Config => {
	try {
		const schema = object({
			stage: union(['test', 'stage', 'dev', 'prod']).optional(),
			port: number().transform().min(0).max(65535).optional().default(4000),
			name: string().min(2).max(12).optional().default('fluxify'),

			allowOrigin: string().min(8).max(128).optional().default('*'),
			globalPrefix: string().min(1).max(12).optional().default(''),
			defaultVersion: number().transform().min(1).max(9).optional().default(0),

			jwtSecret: string().min(16).max(256).optional().default(randomBytes(32).toString('hex')),
			jwtExpiry: number().transform().min(0).max(77760000).optional().default(1600),

			cacheTtl: number().transform().min(0).max(3600).optional().default(0),
			cacheLimit: number().transform().min(0).max(4096).optional().default(0),

			throttleTtl: number().transform().min(0).max(3600).optional().default(0),
			throttleLimit: number().transform().min(0).max(2048).optional().default(0),
			throttleRegrow: number().transform().min(0).max(512).optional().default(0),

			databasePath: string().optional().default(':memory:'),
			databaseMode: union(['readwrite', 'readonly']).optional().default('readwrite'),

			logLevel: union(['trace', 'debug', 'info', 'warn', 'error']).optional().default('info'),
			logRequests: boolean().transform().optional().default(false),
			logResponses: boolean().transform().optional().default(false),
		});
		const config = schema.parse({
			stage: determineStage(env.npm_lifecycle_event, env.NODE_ENV),
			port: env.PORT,
			name: env.NAME,
			allowOrigin: env.ALLOW_ORIGIN,
			globalPrefix: env.GLOBAL_PREFIX,
			defaultVersion: env.DEFAULT_VERSION,
			jwtSecret: env.JWT_SECRET,
			jwtExpiry: env.JWT_EXPIRY,
			cacheTtl: env.CACHE_TTL,
			cacheLimit: env.CACHE_LIMIT,
			throttleTtl: env.THROTTLE_TTL,
			throttleLimit: env.THROTTLE_LIMIT,
			throttleRegrow: env.THROTTLE_REGROW,
			databasePath: env.DATABASE_PATH,
			databaseMode: env.DATABASE_MODE,
			logLevel: env.LOG_LEVEL,
			logRequests: env.LOG_REQUESTS,
			logResponses: env.LOG_RESPONSES,
		});

		return config;
	} catch (err) {
		throw `config: ${(err as { message?: string })?.message}`;
	}
};

// FIXME: remove this hacky workaround when bun implements a hot reloaded env
export const hotReloadEnv = (env: string): void => {
	if (env && determineStage(process.env.npm_lifecycle_event, process.env.NODE_ENV) === 'dev') {
		const lines = env
			.split('\n')
			.map((line) => line.trim())
			.filter((line) => line.length)
			.filter((line) => !line.startsWith('#'));
		lines.forEach((line) => (process.env[line.split('=')[0]] = line.split('=')[1]));
		validatedConfig = validateConfig(process.env);
	}
};

// TODO: remove function call
try {
	await import('../../.env' as string);
	hotReloadEnv(readFileSync('.env', 'utf8'));
} catch {
	null;
}

// TODO: make this const again and rename to config for direct export
validatedConfig = validateConfig(process.env);
export { validatedConfig as config };
