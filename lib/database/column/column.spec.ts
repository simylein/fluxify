import { describe, expect, test } from 'bun:test';
import { expectType } from '../../test/expect-type';
import { column } from './column';

describe(column.name, () => {
	test('should have a correct type array', () => {
		expect(column('int').type).toEqual('int');
		expectType<number>(column('int').parse(null));
		expect(column('integer').type).toEqual('integer');
		expectType<number>(column('integer').parse(null));
		expect(column('tinyint').type).toEqual('tinyint');
		expectType<number>(column('tinyint').parse(null));
		expect(column('smallint').type).toEqual('smallint');
		expectType<number>(column('smallint').parse(null));
		expect(column('mediumint').type).toEqual('mediumint');
		expectType<number>(column('mediumint').parse(null));
		expect(column('bigint').type).toEqual('bigint');
		expectType<number>(column('bigint').parse(null));
		expect(column('int2').type).toEqual('int2');
		expectType<number>(column('int2').parse(null));
		expect(column('int8').type).toEqual('int8');
		expectType<number>(column('int8').parse(null));
		expect(column('character').type).toEqual('character');
		expectType<string>(column('character').parse(null));
		expect(column('varchar').type).toEqual('varchar');
		expectType<string>(column('varchar').parse(null));
		expect(column('text').type).toEqual('text');
		expectType<string>(column('text').parse(null));
		expect(column('blob').type).toEqual('blob');
		expectType<string>(column('blob').parse(null));
		expect(column('real').type).toEqual('real');
		expectType<number>(column('real').parse(null));
		expect(column('double').type).toEqual('double');
		expectType<number>(column('double').parse(null));
		expect(column('float').type).toEqual('float');
		expectType<number>(column('float').parse(null));
		expect(column('numeric').type).toEqual('numeric');
		expectType<number>(column('numeric').parse(null));
		expect(column('decimal').type).toEqual('decimal');
		expectType<number>(column('decimal').parse(null));
		expect(column('boolean').type).toEqual('boolean');
		expectType<boolean>(column('boolean').parse(null));
		expect(column('date').type).toEqual('date');
		expectType<Date>(column('date').parse(null));
		expect(column('datetime').type).toEqual('datetime');
		expectType<Date>(column('datetime').parse(null));
	});

	test('should set constraints based on called input', () => {
		expect(column('integer').constraints).toEqual({ length: undefined, nullable: false, unique: false });
		expectType<number>(column('integer').parse(null));
		expect(column('integer').length(16).constraints).toEqual({ length: 16, nullable: false, unique: false });
		expectType<number>(column('integer').parse(null));
		expect(column('integer').nullable().constraints).toEqual({ length: undefined, nullable: true, unique: false });
		expectType<number | null>(column('integer').nullable().parse(null));
		expect(column('integer').unique().constraints).toEqual({ length: undefined, nullable: false, unique: true });
		expectType<number | null>(column('integer').unique().parse(null));
		expect(column('integer').length(16).nullable().unique().constraints).toEqual({
			length: 16,
			nullable: true,
			unique: true,
		});
		expectType<number | null>(column('integer').length(16).nullable().unique().parse(null));
	});
});
