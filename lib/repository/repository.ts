import { randomUUID } from 'crypto';
import { config } from '../config/config';
import { ColumnOptions } from '../database/column/column.type';
import { runQuery, selectMany, selectOne } from '../database/database';
import { Entity } from '../database/entity/entity.type';
import { determineOperator, orderBy, paginate, whereMany, whereOne } from './helpers/helpers';
import { ExcludedInsertKeys, FindManyOptions, FindOneOptions, IdEntity, NullablePartial } from './repository.type';
import { transformData, transformEntity } from './transform/transform';

type Repository<T extends IdEntity> = {
	init: () => Promise<void>;
	findMany: <S extends keyof T>(options?: FindManyOptions<T, S>) => Promise<Pick<T, S>[]>;
	findOne: <S extends keyof T>(options: FindOneOptions<T, S>) => Promise<Pick<T, S> | null>;
	insert: (data: NullablePartial<Omit<T, ExcludedInsertKeys>>) => Promise<{ id: IdEntity['id'] }>;
	update: (id: T['id'], data: NullablePartial<Partial<Omit<T, 'id'>>>) => Promise<void>;
	delete: (id: T['id']) => Promise<void>;
	softDelete: (id: T['id']) => Promise<void>;
	restore: (id: T['id']) => Promise<void>;
	wipe: () => Promise<void>;
	drop: () => Promise<void>;
};

export const repository = <T extends IdEntity>(table: Entity<T>): Repository<T> => {
	if (config.databasePath === ':memory:' || config.stage === 'test') {
		runQuery(table.schema);
	}

	const selectKeys = <S extends keyof T>(select?: Partial<Record<S, boolean>>): string => {
		const keys = Object.keys(table.columns).map((key) =>
			table.columns[key].name ? `${table.columns[key].name} as ${key}` : key,
		);
		if (select && Object.keys(select).length) {
			const filteredKeys = Object.keys(select)
				.filter((key) => select[key as keyof Partial<Record<S, boolean>>] === true)
				.map((key) => (table.columns[key].name ? `${table.columns[key].name} as ${key}` : key));
			if (filteredKeys.length) {
				return `select ${filteredKeys.join(',')} from`;
			}
		}
		return `select ${keys.join(',')} from`;
	};

	const whereKeys = (where?: Partial<T>): string | undefined => {
		const columns = Object.keys(table.columns).filter((key) => !('references' in table.columns[key]));
		const deletedColumn = columns.find(
			(column) => (table.columns as Record<string, ColumnOptions>)[column].onDelete === `(datetime('now'))`,
		);
		let deletedKey: string | undefined;
		if (deletedColumn) {
			deletedKey = (table.columns[deletedColumn] as ColumnOptions).name ?? deletedColumn;
		}

		if (where && Object.keys(where).length) {
			const filtered = Object.keys(where).filter((key) => where[key] !== undefined);
			if (filtered.length) {
				const keys = filtered.map((key) => `${table.columns[key].name ?? key} ${determineOperator<T>(where, key)} ?`);
				if (deletedKey) keys.push(`${deletedKey} is null`);
				return `where ${keys.join(' and ')}`;
			}
		}

		return deletedKey ? `where ${deletedKey} is null` : undefined;
	};

	return {
		init(): Promise<void> {
			return new Promise((resolve) => {
				runQuery(table.schema);
				resolve(void 0);
			});
		},

		findMany<S extends keyof T>(options?: FindManyOptions<T, S>): Promise<Pick<T, S>[]> {
			return new Promise((resolve) => {
				const [where, select, order, skip, take] = [
					options?.where,
					options?.select,
					options?.order,
					options?.skip,
					options?.take,
				];
				const constraints = [
					selectKeys(select),
					table.name,
					orderBy<T, S>(order),
					whereKeys(where),
					paginate<T, S>(take, skip),
				];
				const entities = selectMany<T>(
					`${constraints.filter((constraint) => !!constraint).join(' ')}`,
					whereMany<T, S>(where),
				);
				const transformed = entities.map((entity) => transformEntity(table, entity));
				resolve(transformed);
			});
		},

		findOne<S extends keyof T>(options: FindOneOptions<T, S>): Promise<Pick<T, S> | null> {
			return new Promise((resolve) => {
				const [where, select] = [options.where, options?.select];

				if (!Object.keys(where).length) {
					throw Error(`find one needs at least one where key`);
				}

				const constraints = [selectKeys(select), table.name, whereKeys(where)];
				const entity = selectOne<T>(
					`${constraints.filter((constraint) => !!constraint).join(' ')}`,
					whereOne<T, S>(where),
				);
				const transformed = entity === null ? null : transformEntity<T>(table, entity);
				resolve(transformed);
			});
		},

		insert(data: NullablePartial<Omit<T, ExcludedInsertKeys>>): Promise<{ id: IdEntity['id'] }> {
			return new Promise((resolve) => {
				const id = randomUUID();
				const keys = Object.keys(data)
					.filter((key) => data[key as keyof NullablePartial<Omit<T, ExcludedInsertKeys>>] !== undefined)
					.map((key) => table.columns[key].name ?? key);
				const placeholders = Object.keys(data)
					.filter((key) => data[key as keyof NullablePartial<Omit<T, ExcludedInsertKeys>>] !== undefined)
					.map(() => '?');
				const values = transformData(data);

				const columnKeys = Object.keys(table.columns).filter((key) => !('references' in table.columns[key]));
				const columns = table.columns as Record<string, ColumnOptions>;

				const createdColumn = columnKeys.find((column) => columns[column].onInsert === `(datetime('now'))`);
				const updatedColumn = columnKeys.find((column) => columns[column].onUpdate === `(datetime('now'))`);
				const deletedColumn = columnKeys.find((column) => columns[column].onDelete === `(datetime('now'))`);

				if (createdColumn) {
					keys.push(columns[createdColumn].name ?? createdColumn);
					placeholders.push(`${columns[createdColumn].default}`);
				}
				if (updatedColumn) {
					keys.push(columns[updatedColumn].name ?? updatedColumn);
					placeholders.push(`${columns[updatedColumn].default}`);
				}
				if (deletedColumn) {
					keys.push(columns[deletedColumn].name ?? deletedColumn);
					placeholders.push(`${columns[deletedColumn].default}`);
				}

				runQuery(`insert into ${table.name} (id,${keys.join(',')}) values (?,${placeholders.join(',')})`, [
					id,
					...values,
				]);
				resolve({ id });
			});
		},

		update(id: T['id'], data: NullablePartial<Partial<Omit<T, 'id'>>>): Promise<void> {
			return new Promise((resolve) => {
				const keys = Object.keys(data)
					.filter((key) => data[key as keyof NullablePartial<Partial<Omit<T, 'id'>>>] !== undefined)
					.map((key) => table.columns[key].name ?? key)
					.map((key) => `${key} = ?`);

				const values = transformData(data);
				const columns = Object.keys(table.columns).filter((key) => !('references' in table.columns[key]));
				const updatedColumn = columns.find(
					(column) => (table.columns as Record<string, ColumnOptions>)[column].onUpdate === `(datetime('now'))`,
				);

				if (updatedColumn && (table.columns[updatedColumn] as ColumnOptions).onUpdate === `(datetime('now'))`) {
					keys.push(`${(table.columns[updatedColumn] as ColumnOptions).name ?? updatedColumn} = (datetime('now'))`);
				}

				runQuery(`update ${table.name} set ${keys} where id = ?`, [...values, id]);
				resolve(void 0);
			});
		},

		delete(id: T['id']): Promise<void> {
			return new Promise((resolve) => {
				runQuery(`delete from ${table.name} where id = ?`, [id]);
				resolve(void 0);
			});
		},

		softDelete(id: T['id']): Promise<void> {
			return new Promise((resolve) => {
				const columns = Object.keys(table.columns).filter((key) => !('references' in table.columns[key]));
				const deletedColumn = columns.find(
					(column) => (table.columns as Record<string, ColumnOptions>)[column].onDelete === `(datetime('now'))`,
				);

				if (deletedColumn) {
					const key = (table.columns[deletedColumn] as ColumnOptions).name ?? deletedColumn;
					runQuery(`update ${table.name} set ${key} = (datetime('now')) where id = ?`, [id]);
					resolve(void 0);
				} else {
					throw Error(`entity '${table.name}' has no deleted column`);
				}
			});
		},

		restore(id: T['id']): Promise<void> {
			return new Promise((resolve) => {
				const columns = Object.keys(table.columns).filter((key) => !('references' in table.columns[key]));
				const deletedColumn = columns.find(
					(column) => (table.columns as Record<string, ColumnOptions>)[column].onDelete === `(datetime('now'))`,
				);

				if (deletedColumn) {
					const key = (table.columns[deletedColumn] as ColumnOptions).name ?? deletedColumn;
					runQuery(`update ${table.name} set ${key} = null where id = ?`, [id]);
					resolve(void 0);
				} else {
					throw Error(`entity '${table.name}' has no deleted column`);
				}
			});
		},

		wipe(): Promise<void> {
			return new Promise((resolve) => {
				runQuery(`delete from ${table.name}`);
				resolve(void 0);
			});
		},

		drop(): Promise<void> {
			return new Promise((resolve) => {
				runQuery(`drop table ${table.name}`);
				resolve(void 0);
			});
		},
	};
};
