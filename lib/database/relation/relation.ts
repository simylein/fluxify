import { Action, Constraints, Type } from '../column/column.type';
import { Entity } from '../entity/entity.type';
import { RelationParser } from './relation.type';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const relation = (entity: Entity<any>): RelationParser => {
	const options = {
		type: 'varchar' as Type,
		constraints: {
			name: undefined,
			nullable: false,
			references: { entity: entity.name, column: 'id' },
		} as Constraints,
		nullable: () => {
			options.constraints.nullable = true;
			return options;
		},
		delete: (action: Action) => {
			options.constraints.hooks = {};
			options.constraints.hooks.onDelete = action;
			return options;
		},
		name: (name: string) => {
			options.constraints.name = name;
			return options;
		},
		parse: (argument: unknown) => {
			return argument as string;
		},
	};
	return options;
};
