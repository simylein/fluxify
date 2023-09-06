import { randomUUID } from 'crypto';
import { config } from '../config/config';
import { ColumnOptions } from '../database/column/column.type';
import { insertOne, runQuery, selectMany, selectOne } from '../database/database';
import { Entity } from '../database/entity/entity.type';
import { debug } from '../logger/logger';
import { determineOperator, orderBy, paginate, whereMany, whereOne } from './helpers/helpers';
import { FindOneOptions, FindOptions, IdEntity, NullablePartial, OptionalKeys } from './repository.type';
import { transformData, transformEntity } from './transform/transform';

type Repository<T extends IdEntity> = {
	init: () => Promise<void>;
	find: <S extends keyof T>(options?: FindOptions<T, S>) => Promise<Pick<T, S>[]>;
	findOne: <S extends keyof T>(options: T['id'] | FindOneOptions<T, S>) => Promise<Pick<T, S> | null>;
	insert: (data: NullablePartial<Omit<T, OptionalKeys>> & { [K in OptionalKeys]?: T[K] }) => Promise<{ id: T['id'] }>;
	update: (criteria: T['id'] | Partial<T>, data: NullablePartial<Partial<Omit<T, 'id'>>>) => Promise<void>;
	delete: (criteria: T['id'] | Partial<T>) => Promise<void>;
	softDelete: (criteria: T['id'] | Partial<T>) => Promise<void>;
	restore: (criteria: T['id'] | Partial<T>) => Promise<void>;
	wipe: () => Promise<void>;
	drop: () => Promise<void>;
};

export const repository = <T extends IdEntity>(table: Entity<T>): Repository<T> => {
	if (config.databasePath === ':memory:' || config.stage === 'test') {
		debug(`creating schema for table '${table.name}'`);
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

	const whereKeys = (where?: Partial<T>, deleted = false): string | undefined => {
		const columns = Object.keys(table.columns).filter((key) => !('references' in table.columns[key]));
		const deletedColumn = columns.find(
			(column) => (table.columns as Record<string, ColumnOptions>)[column].onDelete === `(datetime('now'))`,
		);
		let deletedKey: string | undefined;
		if (deletedColumn && !deleted) {
			deletedKey = (table.columns[deletedColumn] as ColumnOptions).name ?? deletedColumn;
		}

		if (where && Object.keys(where).length) {
			const filtered = Object.keys(where).filter((key) => where[key] !== undefined);
			if (filtered.length) {
				const keys = filtered.map((key) => `${table.columns[key].name ?? key} ${determineOperator<T>(where, key)} ?`);
				if (deletedKey && !deleted) keys.push(`${deletedKey} is null`);
				return `where ${keys.join(' and ')}`;
			}
		}

		return deletedKey ? `where ${deletedKey} is null` : undefined;
	};

	return {
		init(): Promise<void> {
			return new Promise((resolve) => {
				runQuery(table.schema);
				return resolve(void 0);
			});
		},

		find<S extends keyof T>(options?: FindOptions<T, S>): Promise<Pick<T, S>[]> {
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
					whereKeys(where),
					orderBy<T, S>(order),
					paginate<T, S>(take, skip),
				].filter((constraint) => !!constraint);
				const entities = selectMany<T>(`${constraints.join(' ')}`, whereMany<T, S>(where));
				const transformed = entities.map((entity) => transformEntity(table, entity));
				return resolve(transformed);
			});
		},

		findOne<S extends keyof T>(options: T['id'] | FindOneOptions<T, S>): Promise<Pick<T, S> | null> {
			return new Promise((resolve) => {
				let where: FindOneOptions<T, S>['where'] = {};
				let select: FindOptions<T, S>['select'] = undefined;
				typeof options !== 'object' ? (where.id = options) : ([where, select] = [options.where, options?.select]);

				if (!Object.keys(where).length) {
					throw Error(`find one needs at least one where key`);
				}

				const constraints = [selectKeys(select), table.name, whereKeys(where)].filter((constraint) => !!constraint);
				const entity = selectOne<T>(`${constraints.join(' ')}`, whereOne<T, S>(where));
				const transformed = entity === null ? null : transformEntity<T>(table, entity);
				return resolve(transformed);
			});
		},

		insert(data: NullablePartial<Omit<T, OptionalKeys>> & { [K in OptionalKeys]?: T[K] }): Promise<{ id: T['id'] }> {
			return new Promise((resolve) => {
				const uuid = data.id ?? table.columns.id.type === 'integer' ? undefined : randomUUID();
				const keys = Object.keys(data)
					.filter((key) => data[key as keyof NullablePartial<Omit<T, OptionalKeys>>] !== undefined)
					.map((key) => table.columns[key].name ?? key);
				const placeholders = Object.keys(data)
					.filter((key) => data[key as keyof NullablePartial<Omit<T, OptionalKeys>>] !== undefined)
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

				if (uuid) {
					keys.unshift('id');
					values.unshift(uuid);
					placeholders.unshift('?');
				}

				const { id } = insertOne(
					`insert into ${table.name} (${keys.join(',')}) values (${placeholders.join(',')})`,
					values,
				);
				return resolve({ id });
			});
		},

		update(criteria: T['id'] | Partial<T>, data: NullablePartial<Partial<Omit<T, 'id'>>>): Promise<void> {
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

				let where: Partial<T> = {};
				typeof criteria !== 'object' ? (where.id = criteria) : (where = criteria);

				runQuery(`update ${table.name} set ${keys} ${whereKeys(where)}`, [
					...values,
					...(whereOne<T, keyof T>(where) ?? []),
				]);
				return resolve(void 0);
			});
		},

		delete(criteria: T['id'] | Partial<T>): Promise<void> {
			return new Promise((resolve) => {
				let where: Partial<T> = {};
				typeof criteria !== 'object' ? (where.id = criteria) : (where = criteria);

				runQuery(`delete from ${table.name} ${whereKeys(where)}`, whereOne<T, keyof T>(where));
				return resolve(void 0);
			});
		},

		softDelete(criteria: T['id'] | Partial<T>): Promise<void> {
			return new Promise((resolve) => {
				const columns = Object.keys(table.columns).filter((key) => !('references' in table.columns[key]));
				const deletedColumn = columns.find(
					(column) => (table.columns as Record<string, ColumnOptions>)[column].onDelete === `(datetime('now'))`,
				);

				if (deletedColumn) {
					let where: Partial<T> = {};
					typeof criteria !== 'object' ? (where.id = criteria) : (where = criteria);

					const key = (table.columns[deletedColumn] as ColumnOptions).name ?? deletedColumn;
					runQuery(
						`update ${table.name} set ${key} = (datetime('now')) ${whereKeys(where)}`,
						whereOne<T, keyof T>(where),
					);
					return resolve(void 0);
				} else {
					throw Error(`entity '${table.name}' has no deleted column`);
				}
			});
		},

		restore(criteria: T['id'] | Partial<T>): Promise<void> {
			return new Promise((resolve) => {
				const columns = Object.keys(table.columns).filter((key) => !('references' in table.columns[key]));
				const deletedColumn = columns.find(
					(column) => (table.columns as Record<string, ColumnOptions>)[column].onDelete === `(datetime('now'))`,
				);

				if (deletedColumn) {
					let where: Partial<T> = {};
					typeof criteria !== 'object' ? (where.id = criteria) : (where = criteria);

					const key = (table.columns[deletedColumn] as ColumnOptions).name ?? deletedColumn;
					runQuery(`update ${table.name} set ${key} = null ${whereKeys(where, true)}`, whereOne<T, keyof T>(where));
					return resolve(void 0);
				} else {
					throw Error(`entity '${table.name}' has no deleted column`);
				}
			});
		},

		wipe(): Promise<void> {
			return new Promise((resolve) => {
				runQuery(`delete from ${table.name}`);
				return resolve(void 0);
			});
		},

		drop(): Promise<void> {
			return new Promise((resolve) => {
				runQuery(`drop table ${table.name}`);
				return resolve(void 0);
			});
		},
	};
};
