import { Database, SQLQueryBindings } from 'bun:sqlite';
import { config } from '../config/config';
import { debug } from '../logger/logger';
import { IdEntity } from '../repository/repository.type';

const database = new Database(config.stage === 'test' ? ':memory:' : config.databasePath, {
	readonly: config.stage === 'test' ? false : config.databaseMode === 'readonly',
	readwrite: config.stage === 'test' ? true : config.databaseMode === 'readwrite',
});
database.run('pragma foreign_keys = on;');

export const runQuery = (query: string, params: SQLQueryBindings[] = []): void => {
	// eslint-disable-next-line
	// @ts-expect-error
	const statement = database.prepare(`${query};`, params);
	debug(statement.toString());
	return statement.run();
};

export const selectOne = <T extends IdEntity>(query: string, params: SQLQueryBindings[] = []): T | null => {
	// eslint-disable-next-line
	// @ts-expect-error
	const statement = database.prepare(`${query};`, params);
	debug(statement.toString());
	return statement.get() as T | null;
};

export const selectMany = <T extends IdEntity>(query: string, params: SQLQueryBindings[] = []): T[] => {
	// eslint-disable-next-line
	// @ts-expect-error
	const statement = database.prepare(`${query};`, params);
	debug(statement.toString());
	return statement.all() as T[];
};
