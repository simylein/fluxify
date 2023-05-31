import { config } from 'lib/config';
import { LoggerError, LoggerInfo, LoggerWarn } from 'lib/logger';
import { repository } from 'lib/repository';
import { logEntity } from './log.entity';

const logRepository = repository(logEntity);

export const logInfo = async ({ timestamp, context, message }: LoggerInfo): Promise<void> => {
	if (config.databaseMode === 'readwrite') {
		await logRepository.insert({ timestamp, level: 'info', context, message });
	}
};

export const logWarn = async ({ timestamp, context, message }: LoggerWarn): Promise<void> => {
	if (config.databaseMode === 'readwrite') {
		await logRepository.insert({ timestamp, level: 'warn', context, message });
	}
};

export const logError = async ({ timestamp, context, message, stack }: LoggerError): Promise<void> => {
	if (config.databaseMode === 'readwrite') {
		await logRepository.insert({ timestamp, level: 'error', context, message, stack: `${stack}` });
	}
};
