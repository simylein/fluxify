import { describe, expect, test } from 'bun:test';
import { expectType } from '../../test/expect-type';
import { data, material, materials } from './material';

describe('data', () => {
	test('should contain twenty four materials', () => {
		expect(data).toBeArrayOfSize(24);
	});
});

describe(material.name, () => {
	test('should return a random material', () => {
		expect(material()).toBeOneOf(data);
		expect(material()).toBeOneOf(data);
	});

	expectType<string>(material());
});

describe(materials.name, () => {
	test('should return specified amount of random materials', () => {
		expect(materials(2)).toBeArrayOfSize(2);
		expect(materials(4)).toBeArrayOfSize(4);
		expect(materials(2)[0]).toBeOneOf(data);
		expect(materials(4)[2]).toBeOneOf(data);
	});

	expectType<string[]>(materials(2));
});
