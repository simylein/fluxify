import { ParseFunction } from '../../validation/parser.type';
import { Constraints, Parser, RecursiveParser, Type } from '../column/column.type';

export type RelationParser = RecursiveParser<
	{
		type: Type;
		constraints: Constraints;
		nullable: Parser<string | null>;
		delete: Parser<string>;
		name: Parser<string>;
		parse: ParseFunction<string>;
	},
	string,
	string
>;

export type RelationOptions = {
	name?: string;
	nullable?: boolean;
	references: {
		entity: string;
		column: string;
	};
};
