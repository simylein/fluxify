import { describe, expect, test } from 'bun:test';
import { expectType } from '../../test/expect-type';
import { column } from '../column/column';
import { created } from '../created/created';
import { deleted } from '../deleted/deleted';
import { primary } from '../primary/primary';
import { updated } from '../updated/updated';
import { entity } from './entity';

const userEntity = entity('user', {
	id: primary(),
	username: column('varchar').length(16).unique(),
	password: column('varchar').length(64),
	age: column('integer').nullable(),
	createdAt: created(),
	updatedAt: updated(),
	deletedAt: deleted(),
});

type User = {
	id: string;
	username: string;
	password: string;
	age: number | null;
	createdAt: Date;
	updatedAt: Date | null;
	deletedAt: Date | null;
};

describe(entity.name, () => {
	test('should create a user entity with the correct name and schema', () => {
		const columns: string[] = [
			'id character(36) not null unique primary key',
			'username varchar(16) not null unique',
			'password varchar(64) not null',
			'age integer null',
			`createdAt datetime not null default (datetime('now'))`,
			'updatedAt datetime null default null',
			'deletedAt datetime null default null',
		];
		expect(userEntity.name).toEqual('user');
		expectType<string>(userEntity.name);
		expect(userEntity.schema).toEqual(`create table if not exists user (${columns.join(',')})`);
		expectType<string>(userEntity.schema);
		expectType<User>(userEntity.parser.parse(null));
	});
});
