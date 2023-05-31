import { describe, expect, test } from 'bun:test';
import { column } from './column';

describe(column.name, () => {
	test('should have a correct type array', () => {
		expect(column('int').type).toEqual('int');
		expect(column('integer').type).toEqual('integer');
		expect(column('tinyint').type).toEqual('tinyint');
		expect(column('smallint').type).toEqual('smallint');
		expect(column('mediumint').type).toEqual('mediumint');
		expect(column('bigint').type).toEqual('bigint');
		expect(column('int2').type).toEqual('int2');
		expect(column('int8').type).toEqual('int8');
		expect(column('character').type).toEqual('character');
		expect(column('varchar').type).toEqual('varchar');
		expect(column('text').type).toEqual('text');
		expect(column('blob').type).toEqual('blob');
		expect(column('real').type).toEqual('real');
		expect(column('double').type).toEqual('double');
		expect(column('float').type).toEqual('float');
		expect(column('numeric').type).toEqual('numeric');
		expect(column('decimal').type).toEqual('decimal');
		expect(column('boolean').type).toEqual('boolean');
		expect(column('date').type).toEqual('date');
		expect(column('datetime').type).toEqual('datetime');
	});

	test('should set constraints based on called input', () => {
		expect(column('integer').constraints).toEqual({ length: undefined, nullable: false, unique: false });
		expect(column('integer').length(16).constraints).toEqual({ length: 16, nullable: false, unique: false });
		expect(column('integer').nullable().constraints).toEqual({ length: undefined, nullable: true, unique: false });
		expect(column('integer').unique().constraints).toEqual({ length: undefined, nullable: false, unique: true });
		expect(column('integer').length(16).nullable().unique().constraints).toEqual({
			length: 16,
			nullable: true,
			unique: true,
		});
	});
});
