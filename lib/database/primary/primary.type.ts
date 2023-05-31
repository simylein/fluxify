import { ParseFunction } from '../../validation/parser.type';
import { Constraints, RecursiveParser } from '../column/column.type';

export type PrimaryParser = RecursiveParser<
	{
		type: 'varchar';
		constraints: Constraints;
		parse: ParseFunction<string>;
	},
	string,
	string
>;
