import { Type } from '../column/column.type';
import { PrimaryParser } from './primary.type';

export const primary = (): PrimaryParser => {
	const options = {
		type: 'varchar' as Type,
		constraints: { length: 36, primary: true, unique: true },
		parse: (argument: unknown) => {
			return argument as string;
		},
	};
	return options;
};
