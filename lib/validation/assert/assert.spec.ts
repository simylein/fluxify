import { describe, expect, test } from 'bun:test';
import { ValidationError } from '../error';
import {
	isBoolean,
	isNot,
	isNotMax,
	isNotMaxLength,
	isNotMin,
	isNotMinLength,
	isNotUnion,
	isNumber,
	isObject,
	isString,
	isUnion,
} from './assert';

describe(isNot.name, () => {
	test('should be an instance of validation error', () => {
		expect(isNot('key', 'string')).toBeInstanceOf(ValidationError);
	});

	test('should throw a describing error for given key', () => {
		expect(() => isNot('key', 'string')).toThrow(Error('key is not of type string'));
		expect(() => isNot('value', 'number')).toThrow(Error('value is not of type number'));
		expect(() => isNot('hello', 'boolean')).toThrow(Error('hello is not of type boolean'));
		expect(() => isNot('world', 'object')).toThrow(Error('world is not of type object'));
		expect(() => isNot('title', 'array')).toThrow(Error('title is not of type array'));
		expect(() => isNot('summary', 'undefined')).toThrow(Error('summary is not of type undefined'));
		expect(() => isNot('description', 'null')).toThrow(Error('description is not of type null'));
	});
});

describe(isNotUnion.name, () => {
	test('should not throw given a registered union', () => {
		expect(() => isUnion('dark', ['light', 'dark'])).not.toThrow();
	});

	test('should throw given an unregistered union', () => {
		expect(() => isUnion(42, ['light', 'dark'])).toThrow(Error('42 is not one of light | dark'));
		expect(() => isUnion(true, ['light', 'dark'])).toThrow(Error('true is not one of light | dark'));
		expect(() => isUnion({}, ['light', 'dark'])).toThrow(Error('{} is not one of light | dark'));
		expect(() => isUnion([], ['light', 'dark'])).toThrow(Error('[] is not one of light | dark'));
		expect(() => isUnion(undefined, ['light', 'dark'])).toThrow(Error('undefined is not one of light | dark'));
		expect(() => isUnion(null, ['light', 'dark'])).toThrow(Error('null is not one of light | dark'));
	});
});

describe(isNotMin.name, () => {
	test('should throw that value is smaller than the minimum', () => {
		expect(() => isNotMin(1, 2)).toThrow(Error('1 must not be smaller than 2'));
	});
});

describe(isNotMax.name, () => {
	test('should throw that value is larger than the maximum', () => {
		expect(() => isNotMax(3, 2)).toThrow(Error('3 must not be larger than 2'));
	});
});

describe(isNotMinLength.name, () => {
	test('should throw that value is larger than the maximum', () => {
		expect(() => isNotMinLength('hello', 6)).toThrow(Error('hello must be at least 6 characters long'));
	});
});

describe(isNotMaxLength.name, () => {
	test('should throw that value is larger than the maximum', () => {
		expect(() => isNotMaxLength('hello-world', 8)).toThrow(Error('hello-world must not be longer than 8 characters'));
	});
});

describe(isString.name, () => {
	test('should not throw given a string', () => {
		expect(() => isString('hello-world', {})).not.toThrow();
	});

	test('should throw given anything but a string', () => {
		expect(() => isString(42, {})).toThrow(Error('42 is not of type string'));
		expect(() => isString(true, {})).toThrow(Error('true is not of type string'));
		expect(() => isString({}, {})).toThrow(Error('{} is not of type string'));
		expect(() => isString([], {})).toThrow(Error('[] is not of type string'));
		expect(() => isString(undefined, {})).toThrow(Error('undefined is not of type string'));
		expect(() => isString(null, {})).toThrow(Error('null is not of type string'));
	});
});

describe(isNumber.name, () => {
	test('should not throw given a number', () => {
		expect(() => isNumber(42, {})).not.toThrow();
	});

	test('should throw given anything but a number', () => {
		expect(() => isNumber('hello-world', {})).toThrow(Error('hello-world is not of type number'));
		expect(() => isNumber(true, {})).toThrow(Error('true is not of type number'));
		expect(() => isNumber({}, {})).toThrow(Error('{} is not of type number'));
		expect(() => isNumber([], {})).toThrow(Error('[] is not of type number'));
		expect(() => isNumber(undefined, {})).toThrow(Error('undefined is not of type number'));
		expect(() => isNumber(null, {})).toThrow(Error('null is not of type number'));
	});
});

describe(isBoolean.name, () => {
	test('should not throw given a boolean', () => {
		expect(() => isBoolean(true)).not.toThrow();
	});

	test('should throw given anything but a boolean', () => {
		expect(() => isBoolean('hello-world')).toThrow(Error('hello-world is not of type boolean'));
		expect(() => isBoolean(42)).toThrow(Error('42 is not of type boolean'));
		expect(() => isBoolean({})).toThrow(Error('{} is not of type boolean'));
		expect(() => isBoolean([])).toThrow(Error('[] is not of type boolean'));
		expect(() => isBoolean(undefined)).toThrow(Error('undefined is not of type boolean'));
		expect(() => isBoolean(null)).toThrow(Error('null is not of type boolean'));
	});
});

describe(isObject.name, () => {
	test('should not throw given a object', () => {
		expect(() => isObject({})).not.toThrow();
	});

	test('should throw given anything but a object', () => {
		expect(() => isObject('hello-world')).toThrow(Error('hello-world is not of type object'));
		expect(() => isObject(42)).toThrow(Error('42 is not of type object'));
		expect(() => isObject(true)).toThrow(Error('true is not of type object'));
		expect(() => isObject([])).toThrow(Error('[] is not of type object'));
		expect(() => isObject(undefined)).toThrow(Error('undefined is not of type object'));
		expect(() => isObject(null)).toThrow(Error('null is not of type object'));
	});
});
