import { describe, expect, test } from 'bun:test';
import { expectType } from '../../test/expect-type';
import { Entity } from '../entity/entity.type';
import { relation } from './relation';

const userEntity = { name: 'user', columns: { id: { type: 'character', length: 36 } } } as unknown as Entity<unknown>;
const todoEntity = { name: 'todo', columns: { id: { type: 'integer' } } } as unknown as Entity<unknown>;

describe(relation.name, () => {
	test('should have a correct type array', () => {
		expect(relation(userEntity).type).toEqual('character');
		expect(relation(todoEntity).type).toEqual('integer');
		expectType<string>(relation(userEntity).parse(null));
		expectType<number>(relation<number>(todoEntity).parse(null));
	});

	test('should have the correct constraints', () => {
		expect(relation(userEntity).constraints).toEqual({
			length: 36,
			nullable: false,
			references: { column: 'id', entity: 'user' },
		});
		expect(relation(todoEntity).constraints).toEqual({ nullable: false, references: { column: 'id', entity: 'todo' } });
		expect(relation(todoEntity).name('custom').constraints.name).toEqual('custom');
	});
});
