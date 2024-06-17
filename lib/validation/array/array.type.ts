import { ParseFunction, Parser, RecursiveParser, Type } from '../parser.type';

export type ArrayParser<T> = RecursiveParser<
	{
		type: Type[];
		optional: Parser<T | undefined>;
		nullable: Parser<T | null>;
		min: Parser<T>;
		max: Parser<T>;
		parse: ParseFunction<T>;
	},
	T,
	T
>;
