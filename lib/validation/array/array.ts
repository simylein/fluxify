import { isNot, isNotMaxElements, isNotMinElements } from '../assert/assert';
import { ValidationError } from '../error';
import { Constraints, Parser, Type } from '../parser.type';
import { ArrayParser } from './array.type';

export const indexIsNot = (index: number, type: Type[], value?: unknown): ValidationError => {
	return new ValidationError(
		`index ${index} is not of type ${type.length > 1 ? type.join(' | ') : type[0]} (${
			value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value
		} given)`,
	);
};

export const indexIsMissing = (index: number, type: Type): ValidationError => {
	return new ValidationError(`index ${index} is missing and should be of type ${type}`);
};

export const array = <T>(schema: Parser<T>): ArrayParser<T[]> => {
	function validate(argument: unknown, constraints: Constraints): asserts argument is T[] {
		if (!Array.isArray(argument)) {
			throw isNot(argument, 'array');
		}
		if (constraints.min && argument.length < constraints.min) {
			throw isNotMinElements(argument, constraints.min);
		}
		if (constraints.max && argument.length > constraints.max) {
			throw isNotMaxElements(argument, constraints.max);
		}
		for (let index = 0; index < argument.length; index++) {
			argument[index] = schema.parse(argument[index]);
		}
	}

	const options = {
		type: ['array'] as Type[],
		constraints: { min: undefined, max: undefined } as Constraints,
		transform: () => {
			options.type.push('transform');
			return options;
		},
		optional: () => {
			options.type.push('undefined');
			return options;
		},
		nullable: () => {
			options.type.push('null');
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
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		parse: (argument: unknown): any => {
			if (options.type.includes('undefined') && argument === undefined) {
				return argument;
			}
			if (options.type.includes('null') && argument === null) {
				return argument;
			}
			validate(argument, options.constraints);
			return argument;
		},
	};
	return options;
};
