import { Env } from 'bun';
import { randomBytes } from 'crypto';
import { boolean } from '../validation/boolean/boolean';
import { number } from '../validation/number/number';
import { object } from '../validation/object/object';
import { string } from '../validation/string/string';
import { union } from '../validation/union/union';
import { Config } from './config.type';
import { determineStage } from './stage';

export const validateConfig = (env: Env): Config => {
	try {
		const schema = object({
			stage: union(['test', 'stage', 'dev', 'prod']).optional(),
			port: number().optional().transform().min(0).max(65535).default(4000),
			appName: string().optional().default('fluxify'),

			allowOrigin: string().optional().default('*'),
			globalPrefix: string().optional().default(''),

			jwtSecret: string().optional().default(randomBytes(32).toString('hex')),
			jwtExpiry: number().optional().transform().default(1600),

			databasePath: string().optional().default(':memory:'),
			databaseMode: union(['readwrite', 'readonly']).optional().default('readwrite'),

			logLevel: union(['trace', 'debug', 'info', 'warn', 'error']).optional().default('info'),

			logRequests: boolean().optional().transform().default(true),
			logResponses: boolean().optional().transform().default(true),
		});
		const config = schema.parse({
			stage: determineStage(env.npm_lifecycle_event, env.NODE_ENV),
			port: env.PORT,
			appName: env.APP_NAME,
			allowOrigin: env.ALLOW_ORIGIN,
			globalPrefix: env.GLOBAL_PREFIX,
			jwtSecret: env.JWT_SECRET,
			jwtExpiry: env.JWT_EXPIRY,
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

export const config = validateConfig(process.env);
