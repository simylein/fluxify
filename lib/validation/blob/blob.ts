import { isBlob } from '../assert/assert';
import { BlobParser } from './blob.type';

export const blob = (...types: string[]): BlobParser => {
	const options: BlobParser = {
		type: ['blob'],
		constraints: { min: undefined, max: undefined },
		optional: () => {
			options.type.push('undefined');
			return options;
		},
		nullable: () => {
			options.type.push('null');
			return options;
		},
		min: (size: number) => {
			options.constraints.min = size;
			return options;
		},
		max: (size: number) => {
			options.constraints.max = size;
			return options;
		},
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		parse: (argument: unknown): any => {
			if (options.type.includes('undefined') && argument === undefined) {
				return argument;
			}
			if (options.type.includes('null') && argument === null) {
				return argument;
			}
			isBlob(argument, types, options.constraints);
			return argument;
		},
	};
	return options;
};
