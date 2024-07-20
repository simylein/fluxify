import { Database, SQLQueryBindings } from 'bun:sqlite';
import { config } from '../config/config';
import { Changes } from '../database/database.type';
import { trace } from '../logger/logger';

const database = new Database(config.stage === 'test' ? ':memory:' : config.databasePath, {
	readonly: config.stage === 'test' ? false : config.databaseMode === 'readonly',
	readwrite: config.stage === 'test' ? true : config.databaseMode === 'readwrite',
});
database.run('pragma foreign_keys = on;');

export const runQuery = (query: string, params: SQLQueryBindings[] = []): Promise<Changes> => {
	return new Promise((resolve) => {
		const statement = database.prepare(`${query};`, params);
		trace(statement.toString());
		resolve(statement.run());
	});
};

export const selectOne = <T extends Record<string, unknown>>(
	query: string,
	params: SQLQueryBindings[] = [],
): Promise<T | null> => {
	return new Promise((resolve) => {
		const statement = database.prepare(`${query};`, params);
		trace(statement.toString());
		resolve(statement.get() as T | null);
	});
};

export const selectMany = <T extends Record<string, unknown>>(
	query: string,
	params: SQLQueryBindings[] = [],
): Promise<T[]> => {
	return new Promise((resolve) => {
		const statement = database.prepare(`${query};`, params);
		trace(statement.toString());
		resolve(statement.all() as T[]);
	});
};

export const insertOne = <T extends Record<string, unknown>>(
	query: string,
	params: SQLQueryBindings[] = [],
): Promise<T> => {
	return new Promise((resolve) => {
		const statement = database.prepare(`${query};`, params);
		trace(statement.toString());
		resolve(statement.get() as T);
	});
};

export const insertMany = <T extends Record<string, unknown>>(
	query: string,
	params: SQLQueryBindings[] = [],
): Promise<T[]> => {
	return new Promise((resolve) => {
		const statement = database.prepare(`${query};`, params);
		trace(statement.toString());
		resolve(statement.all() as T[]);
	});
};
