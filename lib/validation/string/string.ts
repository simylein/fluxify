import { isString } from '../assert/assert';
import { StringParser } from './string.type';

export const string = (): StringParser => {
	const options: StringParser = {
		type: ['string'],
		base: undefined,
		constraints: { regex: undefined, min: undefined, max: undefined, trim: false },
		optional: () => {
			options.type.push('undefined');
			return options;
		},
		nullable: () => {
			options.type.push('null');
			return options;
		},
		default: (value: string) => {
			options.base = value;
			return options;
		},
		matches: (regex: RegExp) => {
			options.constraints.regex = regex;
			return options;
		},
		min: (length: number) => {
			options.constraints.min = length;
			return options;
		},
		max: (length: number) => {
			options.constraints.max = length;
			return options;
		},
		trim: () => {
			options.constraints.trim = true;
			return options;
		},
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		parse: (argument: unknown): any => {
			if (argument === undefined && options.type.includes('undefined') && options.base !== undefined) {
				return options.base;
			}
			if (options.type.includes('undefined') && argument === undefined) {
				return argument;
			}
			if (options.type.includes('null') && argument === null) {
				return argument;
			}
			if (options.constraints.trim && typeof argument === 'string') {
				argument = argument.trim();
			}
			isString(argument, options.constraints);
			return argument;
		},
	};
	return options;
};
