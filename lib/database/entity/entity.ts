import { ColumnOptions, Parser } from '../column/column.type';
import { RelationOptions } from '../relation/relation.type';
import { Entity } from './entity.type';

export const generateSchema = <T, S extends Record<string, Parser<T>>>(name: string, columnOptions: S): string => {
	const schemaColumns: string[] = [];
	Object.keys(columnOptions).forEach((key) => {
		const targetColumn = columnOptions[key];
		const options: (string | undefined)[] = [];
		if ('references' in targetColumn.constraints) {
			const column = targetColumn;
			options.push(column.constraints.name ?? key);
			options.push(`character(36) ${column.constraints.nullable ? 'null' : 'not null'}`);
			options.push(`references ${column.constraints.references?.entity}(${column.constraints.references?.column})`);
			column.constraints.hooks?.onDelete && options.push(`on delete ${column.constraints.hooks.onDelete}`);
			schemaColumns.push(options.join(' '));
		} else {
			const column = targetColumn;
			if (column.constraints.primary) {
				schemaColumns.push('id character(36) not null unique primary key');
			} else {
				options.push(column.constraints.name ?? key);
				column.constraints.length
					? options.push(`${column.type}(${column.constraints.length})`)
					: options.push(column.type);
				options.push(column.constraints.nullable ? 'null' : 'not null');
				column.constraints.unique && options.push('unique');
				column.constraints.default !== undefined && options.push(`default ${column.constraints.default}`);
				schemaColumns.push(options.join(' '));
			}
		}
	});
	return `create table if not exists ${name} (${schemaColumns.join(',')})`;
};

export const generateColumns = <T, S extends Record<string, Parser<T>>>(
	columnOptions: S,
): Record<string, ColumnOptions | RelationOptions> => {
	const generatedColumns: Record<string, ColumnOptions | RelationOptions> = {};
	Object.keys(columnOptions).forEach((key) => {
		if ('references' in columnOptions[key].constraints) {
			const columns: RelationOptions = {
				name: columnOptions[key].constraints.name,
				nullable: false,
				references: {
					entity: columnOptions[key].constraints.references?.entity ?? '',
					column: columnOptions[key].constraints.references?.column ?? '',
				},
			};
			generatedColumns[key] = columns;
		} else {
			const options: ColumnOptions = {
				type: columnOptions[key].type,
				name: columnOptions[key].constraints.name,
				length: columnOptions[key].constraints.length,
				nullable: columnOptions[key].constraints.nullable,
				primary: columnOptions[key].constraints.primary,
				default: columnOptions[key].constraints.default,
				unique: columnOptions[key].constraints.unique,
				onInsert: columnOptions[key].constraints.hooks?.onInsert,
				onUpdate: columnOptions[key].constraints.hooks?.onUpdate,
				onDelete: columnOptions[key].constraints.hooks?.onDelete,
			};
			generatedColumns[key] = options;
		}
	});
	return generatedColumns;
};

export const entity = <T, S extends Record<string, Parser<T>>>(
	name: string,
	columnOptions: S,
): Entity<{ [K in keyof S]: ReturnType<S[K]['parse']> }> => {
	const generatedSchema = generateSchema<T, S>(name, columnOptions);
	const generatedColumns = generateColumns<T, S>(columnOptions);

	return {
		name,
		schema: generatedSchema,
		columns: generatedColumns,
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		parser: { ...columnOptions, parse: (argument): argument is null => null },
	};
};
