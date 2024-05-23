import { Constraints, ParseFunction, Parser, RecursiveParser, Type } from '../parser.type';

export type BlobParser = RecursiveParser<
	{
		type: Type[];
		constraints: Constraints;
		optional: Parser<Blob | undefined>;
		nullable: Parser<Blob | null>;
		min: Parser<Blob>;
		max: Parser<Blob>;
		parse: ParseFunction<Blob>;
	},
	Blob,
	Blob
>;
