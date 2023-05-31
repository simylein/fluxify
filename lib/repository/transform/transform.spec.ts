import { describe, expect, test } from 'bun:test';
import { randomUUID } from 'crypto';
import { column } from '../../database/column/column';
import { entity } from '../../database/entity/entity';
import { Infer } from '../../database/entity/entity.type';
import { primary } from '../../database/primary/primary';
import { transformData, transformEntity } from './transform';

const userEntity = entity('user', {
	id: primary(),
	username: column('varchar').length(16),
	password: column('varchar').length(64),
	active: column('boolean'),
});

type User = Infer<typeof userEntity>;

const user1: User = {
	id: randomUUID(),
	username: 'simylein',
	password: 'simylein',
	active: false,
};

const user2: User = {
	id: randomUUID(),
	username: 'simylein',
	password: 'simylein',
	active: true,
};

const user3 = {
	id: randomUUID(),
	active: false,
	createdAt: new Date(),
};

const user4 = {
	id: randomUUID(),
	active: true,
	createdAt: 'hello-world',
};

describe(transformEntity.name, () => {
	test('should transform 0 into false if registered as boolean', () => {
		expect(transformEntity(userEntity, { ...user1, active: 0 as unknown as boolean })).toEqual(user1);
	});

	test('should transform 1 into true if registered as boolean', () => {
		expect(transformEntity(userEntity, { ...user2, active: 1 as unknown as boolean })).toEqual(user2);
	});
});

describe(transformData.name, () => {
	test('should transform date iso string into date object', () => {
		expect(transformData(user3)).toEqual([user3.id, user3.active, user3.createdAt.toISOString()]);
	});

	test('should ignore any other keys on the object', () => {
		expect(transformData(user4)).toEqual([user4.id, user4.active, user4.createdAt]);
	});
});
