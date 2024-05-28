import { Database, SQLQueryBindings } from 'bun:sqlite';
import { config } from '../config/config';
import { debug } from '../logger/logger';
import { IdEntity } from '../repository/repository.type';

const database = new Database(config.stage === 'test' ? ':memory:' : config.databasePath, {
	readonly: config.stage === 'test' ? false : config.databaseMode === 'readonly',
	readwrite: config.stage === 'test' ? true : config.databaseMode === 'readwrite',
});
database.run('pragma foreign_keys = on;');

export const runQuery = (query: string, params: SQLQueryBindings[] = []): Promise<void> => {
	return new Promise((resolve) => {
		const statement = database.prepare(`${query};`, params);
		debug(statement.toString());
		resolve(statement.run());
	});
};

export const selectOne = <T extends IdEntity>(query: string, params: SQLQueryBindings[] = []): Promise<T | null> => {
	return new Promise((resolve) => {
		const statement = database.prepare(`${query};`, params);
		debug(statement.toString());
		resolve(statement.get() as T | null);
	});
};

export const selectMany = <T extends IdEntity>(query: string, params: SQLQueryBindings[] = []): Promise<T[]> => {
	return new Promise((resolve) => {
		const statement = database.prepare(`${query};`, params);
		debug(statement.toString());
		resolve(statement.all() as T[]);
	});
};

export const insertOne = <T extends IdEntity>(query: string, params: SQLQueryBindings[] = []): Promise<T> => {
	return new Promise((resolve) => {
		const statement = database.prepare(`${query};`, params);
		debug(statement.toString());
		resolve(statement.get() as T);
	});
};

export const insertMany = <T extends IdEntity>(query: string, params: SQLQueryBindings[] = []): Promise<T[]> => {
	return new Promise((resolve) => {
		const statement = database.prepare(`${query};`, params);
		debug(statement.toString());
		resolve(statement.all() as T[]);
	});
};
